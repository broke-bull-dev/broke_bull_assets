"""
Generación de puntadas a partir de máscaras binarias (una por color).

Trabaja en pixeles y devuelve puntos en milímetros. El relleno es de tipo
"scanline" (líneas de barrido) en serpentina (boustrophedon) para minimizar
saltos. Soporta ángulo de relleno rotando la máscara.

Cada punto devuelto es una tupla: (x_mm, y_mm, travel)
  - travel=False  -> puntada normal (baja la aguja)
  - travel=True   -> hay que viajar/saltar hasta acá (corte + jump, sin puntada)
"""

import numpy as np
from scipy import ndimage
from skimage import measure


def _runs_in_row(row_mask):
    """Devuelve lista de (c_start, c_end) de tramos True contiguos en una fila."""
    if not row_mask.any():
        return []
    idx = np.flatnonzero(row_mask)
    # cortes donde no son consecutivos
    splits = np.where(np.diff(idx) > 1)[0]
    starts = np.concatenate(([idx[0]], idx[splits + 1]))
    ends = np.concatenate((idx[splits], [idx[-1]]))
    return list(zip(starts.tolist(), ends.tolist()))


def _rotation(angle_deg, rot_shape, orig_shape):
    """Función que mapea (fila,col) del frame rotado -> (fila,col) original.

    ndimage.rotate rota en sentido antihorario alrededor del centro.
    """
    theta = np.radians(angle_deg)
    cos, sin = np.cos(theta), np.sin(theta)
    rc = np.array([rot_shape[0] / 2.0, rot_shape[1] / 2.0])
    oc = np.array([orig_shape[0] / 2.0, orig_shape[1] / 2.0])
    # rotación inversa (de rotado a original)
    R = np.array([[cos, sin], [-sin, cos]])

    def back(r, c):
        v = np.array([r, c]) - rc
        o = R @ v + oc
        return o[0], o[1]

    return back


def fill_mask(mask, mm_per_px, row_spacing_mm, stitch_len_mm,
              angle_deg=0.0, travel_threshold_mm=6.0):
    """Genera puntadas de relleno para una máscara booleana.

    Devuelve lista de (x_mm, y_mm, travel).
    """
    if not mask.any():
        return []

    H, W = mask.shape
    if abs(angle_deg) % 180 < 1e-6:
        rmask = mask.astype(np.uint8)
        back = lambda r, c: (r, c)  # noqa: E731
    else:
        rmask = ndimage.rotate(mask.astype(np.uint8), angle_deg,
                               order=0, reshape=True, prefilter=False)
        back = _rotation(angle_deg, rmask.shape, (H, W))

    row_step = max(1, int(round(row_spacing_mm / mm_per_px)))
    stitch_step = max(1.0, stitch_len_mm / mm_per_px)

    rows = np.where(rmask.any(axis=1))[0]
    if len(rows) == 0:
        return []
    r0, r1 = int(rows[0]), int(rows[-1])

    points = []
    last = None
    flip = False
    for r in range(r0, r1 + 1, row_step):
        runs = _runs_in_row(rmask[r] > 0)
        if not runs:
            continue
        if flip:
            runs = runs[::-1]
        for (cs, ce) in runs:
            if flip:
                cs, ce = ce, cs
            # muestrea puntos a lo largo del tramo
            length = abs(ce - cs)
            n = max(1, int(round(length / stitch_step)))
            cols = np.linspace(cs, ce, n + 1)
            seg = []
            for c in cols:
                orow, ocol = back(r, c)
                x_mm = ocol * mm_per_px
                y_mm = orow * mm_per_px
                seg.append((x_mm, y_mm))
            # decide si el salto desde el último punto es un viaje (corte)
            if last is not None:
                dx = seg[0][0] - last[0]
                dy = seg[0][1] - last[1]
                dist = (dx * dx + dy * dy) ** 0.5
                travel = dist > travel_threshold_mm
            else:
                travel = True  # primer punto del color: viajar (sin puntada)
            points.append((seg[0][0], seg[0][1], travel))
            for p in seg[1:]:
                points.append((p[0], p[1], False))
            last = seg[-1]
        flip = not flip
    return points


def outline_mask(mask, mm_per_px, stitch_len_mm, simplify_px=1.2, min_len_mm=6.0):
    """Genera puntada corrida siguiendo los contornos de la máscara.

    Mejora el filo/definición. Omite contornos cortos (manchitas) para no
    "esbozar" suciedad en imágenes con mucho detalle. Devuelve (x,y,travel)."""
    padded = np.pad(mask.astype(float), 1, mode="constant")
    contours = measure.find_contours(padded, 0.5)
    stitch_step = max(1.0, stitch_len_mm / mm_per_px)
    min_len_px = min_len_mm / mm_per_px
    points = []
    for contour in contours:
        if len(contour) < 4:
            continue
        # longitud total del contorno; descarta los muy chicos
        clen = np.sum(np.sqrt(np.sum(np.diff(contour, axis=0) ** 2, axis=1)))
        if clen < min_len_px:
            continue
        simp = measure.approximate_polygon(contour, tolerance=simplify_px)
        if len(simp) < 2:
            continue
        first = True
        for i in range(len(simp)):
            r0, c0 = simp[i]
            r1, c1 = simp[(i + 1) % len(simp)]
            # restamos el padding
            seglen = ((r1 - r0) ** 2 + (c1 - c0) ** 2) ** 0.5
            n = max(1, int(round(seglen / stitch_step)))
            rr = np.linspace(r0, r1, n + 1)
            cc = np.linspace(c0, c1, n + 1)
            pts = list(zip(rr, cc))
            sub = pts if first else pts[1:]
            for (r, c) in sub:
                x_mm = (c - 1) * mm_per_px
                y_mm = (r - 1) * mm_per_px
                travel = first
                points.append((x_mm, y_mm, travel))
                first = False
    return points
