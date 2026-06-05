"""
Embroidery Studio — app web standalone para convertir logos en archivos .DST
(Tajima) listos para tu Bai de 15 agujas.

Uso:
    pip install -r requirements.txt
    python app.py
    abrí http://localhost:5000
"""

import base64
import io
import os
import uuid

from flask import Flask, request, jsonify, send_file, render_template, abort

from digitizer import digitize, Options, THREADS

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 25 * 1024 * 1024  # 25 MB

OUT_DIR = os.path.join(os.path.dirname(__file__), "outputs")
os.makedirs(OUT_DIR, exist_ok=True)

# resultados en memoria para la descarga (id -> dict)
_JOBS = {}


def _b(name, default=False):
    v = request.form.get(name)
    if v is None:
        return default
    return str(v).lower() in ("1", "true", "on", "yes", "si", "sí")


def _f(name, default):
    try:
        return float(request.form.get(name, default))
    except (TypeError, ValueError):
        return default


def _i(name, default):
    try:
        return int(float(request.form.get(name, default)))
    except (TypeError, ValueError):
        return default


@app.route("/")
def index():
    return render_template("index.html", thread_count=len(THREADS))


@app.route("/api/digitize", methods=["POST"])
def api_digitize():
    if "image" not in request.files:
        return jsonify({"error": "No subiste ninguna imagen."}), 400
    f = request.files["image"]
    data = f.read()
    if not data:
        return jsonify({"error": "La imagen está vacía."}), 400

    opts = Options(
        width_mm=max(10.0, min(400.0, _f("width_mm", 100))),
        max_colors=max(1, min(15, _i("max_colors", 6))),
        row_spacing_mm=max(0.25, min(1.5, _f("row_spacing_mm", 0.40))),
        stitch_len_mm=max(1.0, min(7.0, _f("stitch_len_mm", 2.2))),
        fill_angle_deg=_f("fill_angle_deg", 0),
        remove_background=_b("remove_background", True),
        outline=_b("outline", True),
        underlay=_b("underlay", True),
    )

    try:
        res = digitize(data, opts)
    except Exception as e:  # noqa: BLE001
        app.logger.exception("digitize failed")
        return jsonify({"error": f"No pude procesar la imagen: {e}"}), 500

    job_id = uuid.uuid4().hex[:12]
    _JOBS[job_id] = {
        "dst": res.dst_bytes,
        "txt": res.sequence_txt,
        "name": os.path.splitext(f.filename or "bordado")[0],
    }
    # limita memoria: conserva sólo los últimos 30 jobs
    if len(_JOBS) > 30:
        for k in list(_JOBS)[:-30]:
            _JOBS.pop(k, None)

    return jsonify({
        "id": job_id,
        "width_mm": res.width_mm,
        "height_mm": res.height_mm,
        "stitch_count": res.stitch_count,
        "preview": "data:image/png;base64," + base64.b64encode(res.preview_png).decode(),
        "layers": [
            {"order": L.order, "code": L.code, "name": L.name,
             "hex": "#%02X%02X%02X" % L.rgb, "stitches": L.stitches}
            for L in res.layers
        ],
        "warnings": res.warnings,
    })


@app.route("/download/<job_id>.<kind>")
def download(job_id, kind):
    job = _JOBS.get(job_id)
    if not job or kind not in ("dst", "txt"):
        abort(404)
    name = job["name"]
    if kind == "dst":
        return send_file(io.BytesIO(job["dst"]), mimetype="application/octet-stream",
                         as_attachment=True, download_name=f"{name}.dst")
    return send_file(io.BytesIO(job["txt"].encode("utf-8")), mimetype="text/plain",
                     as_attachment=True, download_name=f"{name}_secuencia.txt")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
