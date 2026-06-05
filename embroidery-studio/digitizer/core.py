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
    pull_comp_mm: float = 0.20       # compensación de tracción (evita huecos)
    min_area_mm2: float = 1.5        # descarta manchitas más chicas que esto
    work_px: int = 900               # resolución de trabajo (lado mayor)
    photo_mode: bool = False         # modo foto: para imágenes realistas


@dataclass
class ColorLayer:
    order: int
    rgb: tuple              # color REAL de la imagen (lo que se borda / preview)
    thread_code: str        # hilo Madeira más parecido (para comprar/cargar)
    thread_name: str
    thread_rgb: tuple
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
    if scale != 1.0:
        img = img.resize((max(1, round(w * scale)), max(1, round(h * scale))),
                         Image.LANCZOS)
    alpha = np.array(img.split()[-1])
    # compone sobre blanco para tener color sólido
    bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
    rgb_img = Image.alpha_composite(bg, img).convert("RGB")
    # aplana el ruido de compresión / anti-aliasing manteniendo los bordes:
    # ModeFilter unifica cada zona a su color dominante (ideal para colores planos)
    rgb_img = rgb_img.filter(ImageFilter.MedianFilter(3))
    rgb_img = rgb_img.filter(ImageFilter.ModeFilter(5))
    return np.array(rgb_img), alpha


def _quantize(rgb, n_colors):
    """Cuantiza a n_colors. Devuelve (labels HxW, palette_rgb list)."""
    im = Image.fromarray(rgb)
    q = im.quantize(colors=n_colors, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
    labels = np.array(q)
    pal = q.getpalette()[: n_colors * 3]
    palette = [tuple(pal[i:i + 3]) for i in range(0, len(pal), 3)]
    return labels, palette


def _quantize_kmeans(rgb, n_colors):
    """Cuantización perceptual con k-means en espacio CIE-Lab.

    Da colores más naturales en fotos/degradados que la cuantización común."""
    from scipy.cluster.vq import kmeans2, vq
    from skimage import color as skcolor

    H, W = rgb.shape[:2]
    lab = skcolor.rgb2lab(rgb.astype(np.float64) / 255.0).reshape(-1, 3)
    # muestrea para acelerar el cálculo de centroides
    rng = np.random.default_rng(0)
    m = min(30000, lab.shape[0])
    sample = lab[rng.choice(lab.shape[0], m, replace=False)]
    cent, _ = kmeans2(sample, n_colors, minit="++", seed=0)
    # asigna todos los pixeles al centroide más cercano (vq en C, eficiente)
    codes, _ = vq(lab, cent)
    labels = codes.reshape(H, W).astype(np.int32)
    pal_rgb = skcolor.lab2rgb(cent.reshape(-1, 1, 3)).reshape(-1, 3)
    palette = [tuple(int(round(v * 255)) for v in c) for c in pal_rgb]
    return labels, palette


def _detect_background(labels, alpha, palette, opts):
    """Marca pixeles de fondo (no se bordan).

    Clave: sólo se quita el fondo CONECTADO AL BORDE de la imagen (flood-fill),
    así no se comen blancos/colores interiores (camiseta, bandera, etc.).
    """
    H, W = labels.shape
    bg_mask = np.zeros((H, W), dtype=bool)
    if not opts.remove_background:
        return bg_mask

    # 1) transparencia (también sólo la conectada al borde)
    transp = (alpha < 128) if alpha is not None else np.zeros((H, W), bool)

    # 2) color(es) dominantes del borde
    border = np.concatenate([labels[0, :], labels[-1, :],
                             labels[:, 0], labels[:, -1]])
    bg_labels = set()
    if len(border):
        vals, counts = np.unique(border, return_counts=True)
        order = np.argsort(-counts)
        total = counts.sum()
        acc = 0
        for j in order:
            frac = counts[j] / total
            if frac < 0.08 and acc > 0.5:
                break
            bg_labels.add(int(vals[j]))
            acc += frac

    candidate = transp.copy()
    for bl in bg_labels:
        candidate |= (labels == bl)

    # 3) quedarse SÓLO con lo conectado al borde
    lbl, num = ndimage.label(candidate)
    if num:
        border_ids = set(lbl[0, :]) | set(lbl[-1, :]) | set(lbl[:, 0]) | set(lbl[:, -1])
        border_ids.discard(0)
        bg_mask = np.isin(lbl, list(border_ids))
    return bg_mask


def _disk(r):
    r = max(1, int(r))
    y, x = np.ogrid[-r:r + 1, -r:r + 1]
    return (x * x + y * y) <= r * r


def _clean_mask(mask, mm_per_px, min_area_px):
    """Limpia una máscara de color para que la forma quede prolija:
    - tapa agujeros chicos (poros), pero respeta huecos reales (letras, anillos)
    - suaviza el borde escalonado
    - descarta manchitas sueltas
    """
    if not mask.any():
        return mask

    # 1) tapar SÓLO agujeros chicos (no los huecos grandes intencionales)
    filled = ndimage.binary_fill_holes(mask)
    holes = filled & ~mask
    if holes.any():
        hlbl, hn = ndimage.label(holes)
        if hn:
            hsizes = ndimage.sum(np.ones_like(hlbl), hlbl, index=range(1, hn + 1))
            small_hole = (1.2 / mm_per_px) ** 2          # < ~1.2mm de lado
            for i, s in enumerate(hsizes, start=1):
                if s < small_hole:
                    mask = mask | (hlbl == i)

    # 2) suavizar el borde escalonado (sin destruir trazos finos)
    k = max(3, int(round(0.35 / mm_per_px)) | 1)
    mask = ndimage.median_filter(mask, size=k)

    # 3) descartar componentes muy chicos
    lbl, num = ndimage.label(mask)
    if num:
        sizes = ndimage.sum(np.ones_like(lbl), lbl, index=range(1, num + 1))
        keep_ids = [i for i, s in enumerate(sizes, start=1) if s >= min_area_px]
        mask = np.isin(lbl, keep_ids) if keep_ids else np.zeros_like(mask)
    return mask


def digitize(data, opts: Options) -> Result:
    rgb, alpha = _load_image(data, opts)
    H, W = rgb.shape[:2]
    mm_per_px = opts.width_mm / W
    height_mm = H * mm_per_px

    n = max(2, min(16, opts.max_colors + (1 if opts.remove_background else 0)))
    if opts.photo_mode:
        labels, palette = _quantize_kmeans(rgb, n)
    else:
        labels, palette = _quantize(rgb, n)
    bg_mask = _detect_background(labels, alpha, palette, opts)

    warnings = []
    # en modo foto se descartan manchitas más grandes (menos ruido/saltos)
    min_area_px = opts.min_area_mm2 * (2.5 if opts.photo_mode else 1.0) / (mm_per_px ** 2)

    # aviso si la imagen es foto-realista (degradados/detalle): el bordado
    # automático sólo la puede aproximar.
    n_unique = len(np.unique(rgb.reshape(-1, 3), axis=0))
    if n_unique > 2000:
        warnings.append(
            "Esta imagen es foto-realista (muchos degradados y detalle). El "
            "bordado automático sólo la puede APROXIMAR: subí los colores a "
            "10-14 y, para máxima fidelidad, hace falta digitalización manual.")

    # una capa por color REAL de la imagen (no se fuerza a la paleta de hilos)
    layers_data = []   # (real_rgb, mask, area)
    for lab in range(len(palette)):
        m = (labels == lab) & (~bg_mask)
        if not m.any():
            continue
        mask = _clean_mask(m, mm_per_px, min_area_px)
        area = int(mask.sum())
        if area == 0:
            continue
        layers_data.append((tuple(int(c) for c in palette[lab]), mask, area))

    layers_data.sort(key=lambda x: -x[2])

    # compensación de tracción: cada región se dilata un poquito para que no
    # aparezcan huecos de tela entre colores contiguos.
    pull_px = max(0, int(round(opts.pull_comp_mm / mm_per_px)))
    if pull_px > 0:
        struct = _disk(pull_px)
        layers_data = [(c, ndimage.binary_dilation(m, structure=struct), a)
                       for (c, m, a) in layers_data]

    # respeta el límite de agujas
    if len(layers_data) > opts.max_colors:
        warnings.append(
            f"La imagen tenía {len(layers_data)} colores; se usaron los "
            f"{opts.max_colors} de mayor área. Subí 'Colores' para conservar más.")
        layers_data = layers_data[: opts.max_colors]
    if len(layers_data) > 15:
        layers_data = layers_data[:15]
        warnings.append("Tu máquina tiene 15 agujas: máximo 15 colores por bordado.")

    # hilo Madeira más parecido a cada color real (sólo lista de compra)
    if layers_data:
        thread_idx = nearest_thread_indices(np.array([c for c, _, _ in layers_data]))
    else:
        thread_idx = []

    # ---- construir el patrón ----
    pattern = pe.EmbPattern()
    travel_threshold_mm = max(4.0, opts.stitch_len_mm * 2.5)
    min_outline_len_mm = max(6.0, opts.stitch_len_mm * 4)
    layers = []
    total_stitches = 0

    for order, (real_rgb, mask, area) in enumerate(layers_data, start=1):
        thread = THREADS[int(thread_idx[order - 1])]
        # se borda con el COLOR REAL de la imagen; el nombre lleva la
        # sugerencia Madeira para que el software/operador la vea.
        pattern.add_thread({
            "rgb": (real_rgb[0] << 16) | (real_rgb[1] << 8) | real_rgb[2],
            "name": f"{thread['name']} (~Madeira {thread['code']})",
            "catalog_number": thread["code"],
        })

        # modo foto: cada color va a un ángulo distinto -> los tonos se mezclan
        # ópticamente y se evita el bandeado uniforme.
        if opts.photo_mode:
            layer_angle = (opts.fill_angle_deg + (order - 1) * 23.0) % 180.0
        else:
            layer_angle = opts.fill_angle_deg

        pts = []
        # se rellena cada componente conectado por separado (corte de hilo
        # entre blobs => sin puntadas largas cruzando zonas vacías)
        comp_lbl, ncomp = ndimage.label(mask)
        for ci in range(1, ncomp + 1):
            cmask = (comp_lbl == ci)
            # underlay: relleno escaso (se omite en modo foto para no engrosar)
            if opts.underlay and not opts.photo_mode:
                pts += fill_mask(cmask, mm_per_px,
                                 row_spacing_mm=max(2.0, opts.row_spacing_mm * 6),
                                 stitch_len_mm=opts.stitch_len_mm * 1.5,
                                 angle_deg=layer_angle + 90,
                                 travel_threshold_mm=travel_threshold_mm)
            # relleno principal
            pts += fill_mask(cmask, mm_per_px,
                             row_spacing_mm=opts.row_spacing_mm,
                             stitch_len_mm=opts.stitch_len_mm,
                             angle_deg=layer_angle,
                             travel_threshold_mm=travel_threshold_mm)
        # contorno para definir filos (omite tramos chicos; nunca en modo foto)
        if opts.outline and not opts.photo_mode:
            pts += outline_mask(mask, mm_per_px, stitch_len_mm=opts.stitch_len_mm,
                                min_len_mm=min_outline_len_mm)

        count = _emit_layer(pattern, pts, height_mm)
        total_stitches += count

        layers.append(ColorLayer(order, real_rgb, thread["code"],
                                  thread["name"], thread["rgb"], count))

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


def _render_preview(pattern, layers, width_mm, height_mm, scale=5):
    """Dibuja el resultado de las puntadas para previsualizar, con grosor de
    hilo para que la cobertura se vea como en la tela real."""
    W = max(1, int(width_mm * scale))
    H = max(1, int(height_mm * scale))
    # render a 2x y luego reduce -> antialiasing (bordes más suaves)
    ss = 2
    img = Image.new("RGB", ((W + 24) * ss, (H + 24) * ss), (247, 247, 247))
    draw = ImageDraw.Draw(img)
    thread_w = max(2, int(round(0.45 * scale * ss)))  # grosor ~0.45mm

    blocks = pattern.get_as_colorblocks()
    layer_list = list(layers)
    for li, (stitches, thread) in enumerate(blocks):
        col = layer_list[li].rgb if li < len(layer_list) else (40, 40, 40)
        prev = None
        for (x, y, cmd) in stitches:
            px = (x / 10.0 * scale + 12) * ss
            # deshace el flip vertical del bordado para mostrarlo como la foto
            py = ((height_mm - y / 10.0) * scale + 12) * ss
            if cmd == pe.STITCH:
                if prev is not None:
                    draw.line([prev, (px, py)], fill=col, width=thread_w,
                              joint="curve")
                prev = (px, py)
            else:
                prev = None
    img = img.resize(((W + 24), (H + 24)), Image.LANCZOS)
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
    lines.append("color real de la imagen  ->  hilo Madeira sugerido")
    lines.append("-" * 56)
    for L in layers:
        hexc = "#%02X%02X%02X" % L.rgb
        lines.append(f"  {L.order:>2}. {hexc}  ->  Madeira {L.thread_code:<6} "
                     f"{L.thread_name:<18} ({L.stitches} pts)")
    lines.append("")
    lines.append("El color que se borda es el REAL de tu imagen; el Madeira es")
    lines.append("la sugerencia de cono más parecido para comprar/cargar.")
    lines.append("La máquina hace STOP entre colores: cambiá/confirmá la aguja.")
    return "\n".join(lines)
