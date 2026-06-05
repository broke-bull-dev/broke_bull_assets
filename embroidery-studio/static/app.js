const $ = (id) => document.getElementById(id);
let file = null;

const drop = $("drop");
const fileInput = $("file");

drop.addEventListener("click", () => fileInput.click());
["dragover", "dragenter"].forEach((e) =>
  drop.addEventListener(e, (ev) => { ev.preventDefault(); drop.classList.add("hover"); }));
["dragleave", "drop"].forEach((e) =>
  drop.addEventListener(e, (ev) => { ev.preventDefault(); drop.classList.remove("hover"); }));
drop.addEventListener("drop", (ev) => {
  if (ev.dataTransfer.files.length) setFile(ev.dataTransfer.files[0]);
});
fileInput.addEventListener("change", () => {
  if (fileInput.files.length) setFile(fileInput.files[0]);
});

function setFile(f) {
  if (!f.type.startsWith("image/")) { alert("Subí un archivo de imagen."); return; }
  file = f;
  const img = $("srcPreview");
  img.src = URL.createObjectURL(f);
  img.classList.add("show");
  drop.classList.add("hasimg");
  $("go").disabled = false;
}

$("go").addEventListener("click", async () => {
  if (!file) return;
  const fd = new FormData();
  fd.append("image", file);
  ["width_mm", "max_colors", "row_spacing_mm", "stitch_len_mm", "fill_angle_deg"]
    .forEach((k) => fd.append(k, $(k).value));
  ["remove_background", "outline", "underlay", "photo_mode"]
    .forEach((k) => fd.append(k, $(k).checked ? "1" : "0"));

  $("go").disabled = true;
  $("output").hidden = true;
  const status = $("status");
  status.className = "status";
  status.innerHTML = '<span class="spinner"></span> Generando puntadas… (puede tardar unos segundos)';

  try {
    const r = await fetch("/api/digitize", { method: "POST", body: fd });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Error desconocido");
    render(data);
  } catch (e) {
    status.className = "status err";
    status.textContent = "✗ " + e.message;
  } finally {
    $("go").disabled = false;
  }
});

function render(d) {
  $("status").textContent = "";
  $("output").hidden = false;
  $("resultPreview").src = d.preview;
  $("dims").textContent = `${d.width_mm} × ${d.height_mm} mm`;
  $("stitches").textContent = `${d.stitch_count.toLocaleString()} puntadas`;
  $("dlDst").href = `/download/${d.id}.dst`;
  $("dlTxt").href = `/download/${d.id}.txt`;

  const warn = $("warnings");
  warn.innerHTML = "";
  (d.warnings || []).forEach((w) => {
    const li = document.createElement("li");
    li.textContent = "⚠ " + w;
    warn.appendChild(li);
  });

  const list = $("colorList");
  list.innerHTML = "";
  d.layers.forEach((L) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="swatch" style="background:${L.hex}" title="color real ${L.hex}"></span>
      <span><span class="cname">${L.order}. ${L.hex}</span>
        <br><small style="color:var(--muted)">hilo sugerido: Madeira ${L.code} · ${L.name}</small></span>
      <span class="swatch sm" style="background:${L.thread_hex}" title="Madeira ${L.code}"></span>
      <span class="cmeta">${L.stitches.toLocaleString()} pts</span>`;
    list.appendChild(li);
  });
}
