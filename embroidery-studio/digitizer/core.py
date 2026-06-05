"""
Orquestación del pipeline de digitalizado:

  imagen  ->  cuantización de color  ->  matcheo a hilos  ->
  máscaras por color  ->  puntadas (relleno + contorno)  ->  .DST

Pensado para LOGOS / colores planos, que es donde el bordado queda fiel.
"""

import io
import math
from dataclasses import dataclass, field

import numpy as np
from PIL import Image, ImageFilter, ImageDraw
from scipy import ndimage

import pyembroidery as pe

from .palette import THREADS
from .color_match import nearest_thread_indices
from .stitches import fill_mask, outline_mask


@dataclass
class Options:
    width_mm: float = 100.0          # ancho físico del bordado
    max_colors: int = 6              # nº de colores (máx 15 = agujas de la Bai)
    row_spacing_mm: float = 0.40     # densidad del relleno (separación de líneas)
    stitch_len_mm: float = 2.2       # largo de puntada
    fill_angle_deg: float = 0.0      # ángulo del relleno
    remove_background: bool = True   # quitar el fondo (no bordarlo)
    outline: bool = True             # contorno para definir filos
    underlay: bool = True            # base/underlay para estabilidad
    min_area_mm2: float = 1.0        # descarta manchitas más chicas que esto
    work_px: int = 600               # resolución de trabajo (lado mayor)


@dataclass
class ColorLayer:
    order: int
    code: str
    name: str
    rgb: tuple
    stitches: int = 0


@dataclass
class Result:
    width_mm: float
    height_mm: float
    stitch_count: int
    layers: list = field(default_factory=list)
    warnings: list = field(default_factory=list)
    dst_bytes: bytes = b""
    preview_png: bytes = b""
    sequence_txt: str = ""


# ----------------------------------------------------------------------------

def _load_image(data, opts):
    """Carga, redimensiona a resolución de trabajo y separa el canal alfa."""
    img = Image.open(io.BytesIO(data)).convert("RGBA")
    # redimensiona manteniendo proporción al lado mayor work_px
    w, h = img.size
    scale = opts.work_px / max(w, h)
    if scale < 1.0:
        img = img.resize((max(1, round(w * scale)), max(1, round(h * scale))),
                         Image.LANCZOS)
    alpha = np.array(img.split()[-1])
    # compone sobre blanco para tener color sólido
    bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
    rgb = np.array(Image.alpha_composite(bg, img).convert("RGB"))
    # suaviza ruido de compresión (jpg) sin perder los bordes de un logo
    rgb_img = Image.fromarray(rgb).filter(ImageFilter.MedianFilter(3))
    return np.array(rgb_img), alpha


def _quantize(rgb, n_colors):
    """Cuantiza a n_colors. Devuelve (labels HxW, palette_rgb list)."""
    im = Image.fromarray(rgb)
    q = im.quantize(colors=n_colors, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
    labels = np.array(q)
    pal = q.getpalette()[: n_colors * 3]
    palette = [tuple(pal[i:i + 3]) for i in range(0, len(pal), 3)]
    return labels, palette


def _detect_background(labels, alpha, palette, opts):
    """Marca pixeles de fondo (no se bordan). Combina transparencia + color de borde."""
    H, W = labels.shape
    bg_mask = np.zeros((H, W), dtype=bool)
    if not opts.remove_background:
        return bg_mask
    # 1) transparencia
    if alpha is not None:
        bg_mask |= (alpha < 128)
    # 2) color dominante en el borde de la imagen
    border = np.concatenate([
        labels[0, :], labels[-1, :], labels[:, 0], labels[:, -1]
    ])
    if len(border):
        vals, counts = np.unique(border, return_counts=True)
        bg_label = int(vals[np.argmax(counts)])
        # sólo lo tratamos como fondo si domina claramente el borde
        if counts.max() / counts.sum() > 0.5:
            bg_mask |= (labels == bg_label)
    return bg_mask


def digitize(data, opts: Options) -> Result:
    rgb, alpha = _load_image(data, opts)
    H, W = rgb.shape[:2]
    mm_per_px = opts.width_mm / W
    height_mm = H * mm_per_px

    n = max(2, min(16, opts.max_colors + (1 if opts.remove_background else 0)))
    labels, palette = _quantize(rgb, n)
    bg_mask = _detect_background(labels, alpha, palette, opts)

    # mapear cada color de la paleta cuantizada al hilo más parecido
    thread_idx = nearest_thread_indices(np.array(palette))  # (n,)

    warnings = []
    min_area_px = opts.min_area_mm2 / (mm_per_px ** 2)

    # agrupa los labels que caen en el mismo hilo
    used = {}  # thread_index -> mask
    for lab in range(len(palette)):
        m = (labels == lab) & (~bg_mask)
        if not m.any():
            continue
        ti = int(thread_idx[lab])
        used.setdefault(ti, np.zeros((H, W), dtype=bool))
        used[ti] |= m

    # limpia manchitas y ordena por área descendente
    layers_data = []
    for ti, mask in used.items():
        mask = ndimage.binary_opening(mask, iterations=1)
        # elimina componentes muy chicos
        lbl, num = ndimage.label(mask)
        if num:
            sizes = ndimage.sum(np.ones_like(lbl), lbl, index=range(1, num + 1))
            keep = np.zeros_like(mask)
            for i, s in enumerate(sizes, start=1):
                if s >= min_area_px:
                    keep |= (lbl == i)
            mask = keep
        area = int(mask.sum())
        if area == 0:
            continue
        layers_data.append((ti, mask, area))

    layers_data.sort(key=lambda x: -x[2])

    # respeta el límite de agujas
    if len(layers_data) > opts.max_colors:
        warnings.append(
            f"La imagen necesitaba {len(layers_data)} colores; se recortó a "
            f"{opts.max_colors} (las {opts.max_colors} áreas más grandes).")
        layers_data = layers_data[: opts.max_colors]
    if len(layers_data) > 15:
        layers_data = layers_data[:15]
        warnings.append("Tu máquina tiene 15 agujas: máximo 15 colores por bordado.")

    # ---- construir el patrón ----
    pattern = pe.EmbPattern()
    travel_threshold_mm = max(4.0, opts.stitch_len_mm * 2.5)
    layers = []
    total_stitches = 0

    for order, (ti, mask, area) in enumerate(layers_data, start=1):
        thread = THREADS[ti]
        pattern.add_thread({
            "rgb": (thread["rgb"][0] << 16) | (thread["rgb"][1] << 8) | thread["rgb"][2],
            "name": thread["name"],
            "catalog_number": thread["code"],
        })

        pts = []
        # se rellena cada componente conectado por separado (corte de hilo
        # entre blobs => sin puntadas largas cruzando zonas vacías)
        comp_lbl, ncomp = ndimage.label(mask)
        for ci in range(1, ncomp + 1):
            cmask = (comp_lbl == ci)
            # underlay: relleno escaso perpendicular para fijar la tela
            if opts.underlay:
                pts += fill_mask(cmask, mm_per_px,
                                 row_spacing_mm=max(2.0, opts.row_spacing_mm * 6),
                                 stitch_len_mm=opts.stitch_len_mm * 1.5,
                                 angle_deg=opts.fill_angle_deg + 90,
                                 travel_threshold_mm=travel_threshold_mm)
            # relleno principal
            pts += fill_mask(cmask, mm_per_px,
                             row_spacing_mm=opts.row_spacing_mm,
                             stitch_len_mm=opts.stitch_len_mm,
                             angle_deg=opts.fill_angle_deg,
                             travel_threshold_mm=travel_threshold_mm)
        # contorno para definir filos (maneja todos los componentes internamente)
        if opts.outline:
            pts += outline_mask(mask, mm_per_px, stitch_len_mm=opts.stitch_len_mm)

        count = _emit_layer(pattern, pts, height_mm)
        total_stitches += count

        layers.append(ColorLayer(order, thread["code"], thread["name"],
                                  thread["rgb"], count))

        # cambio de color entre capas (no después de la última)
        if order < len(layers_data):
            pattern.color_change()

    pattern.end()

    # ---- exportar ----
    buf = io.BytesIO()
    pe.write_dst(pattern, buf)
    dst_bytes = buf.getvalue()

    preview = _render_preview(pattern, layers, opts.width_mm, height_mm)
    seq_txt = _sequence_text(layers, opts, total_stitches, height_mm)

    if total_stitches > 60000:
        warnings.append(f"{total_stitches} puntadas es mucho: bajá la densidad "
                        "o el tamaño para acelerar el bordado.")

    return Result(
        width_mm=round(opts.width_mm, 1),
        height_mm=round(height_mm, 1),
        stitch_count=total_stitches,
        layers=layers,
        warnings=warnings,
        dst_bytes=dst_bytes,
        preview_png=preview,
        sequence_txt=seq_txt,
    )


def _emit_layer(pattern, pts, height_mm):
    """Agrega las puntadas de una capa al patrón (en unidades de 1/10 mm).

    Eje Y invertido para que el bordado no salga espejado verticalmente."""
    count = 0
    pending_jump = None
    for (x_mm, y_mm, travel) in pts:
        X = x_mm * 10.0
        Y = (height_mm - y_mm) * 10.0
        if travel:
            # corta el hilo y salta a la nueva posición sin coser
            if count > 0:
                pattern.trim()
            pattern.add_stitch_absolute(pe.JUMP, X, Y)
        else:
            pattern.add_stitch_absolute(pe.STITCH, X, Y)
            count += 1
    return count


def _render_preview(pattern, layers, width_mm, height_mm, scale=4):
    """Dibuja el resultado de las puntadas para previsualizar."""
    W = max(1, int(width_mm * scale))
    H = max(1, int(height_mm * scale))
    img = Image.new("RGB", (W + 20, H + 20), (245, 245, 245))
    draw = ImageDraw.Draw(img)

    # color por bloque (en el mismo orden que las capas)
    blocks = pattern.get_as_colorblocks()
    layer_list = list(layers)
    for li, (stitches, thread) in enumerate(blocks):
        col = layer_list[li].rgb if li < len(layer_list) else (40, 40, 40)
        prev = None
        for (x, y, cmd) in stitches:
            px = x / 10.0 * scale + 10
            # deshace el flip vertical del bordado para mostrarlo como la foto
            py = (height_mm - y / 10.0) * scale + 10
            if cmd == pe.STITCH:
                if prev is not None:
                    draw.line([prev, (px, py)], fill=col, width=1)
                prev = (px, py)
            else:
                prev = None
    return _png_bytes(img)


def _png_bytes(img):
    b = io.BytesIO()
    img.save(b, format="PNG")
    return b.getvalue()


def _sequence_text(layers, opts, total, height_mm):
    lines = []
    lines.append("SECUENCIA DE COLORES / AGUJAS")
    lines.append("=" * 40)
    lines.append(f"Tamaño:   {opts.width_mm:.1f} x {height_mm:.1f} mm")
    lines.append(f"Colores:  {len(layers)}")
    lines.append(f"Puntadas: {total}")
    lines.append("")
    lines.append("Orden de bordado (asigná cada color a una aguja):")
    lines.append("-" * 40)
    for L in layers:
        hexc = "#%02X%02X%02X" % L.rgb
        lines.append(f"  {L.order:>2}. Madeira {L.code:<6} {L.name:<18} "
                     f"{hexc}  ({L.stitches} pts)")
    lines.append("")
    lines.append("La máquina hace STOP entre colores: cambiá/confirmá la aguja")
    lines.append("según este orden.")
    return "\n".join(lines)
