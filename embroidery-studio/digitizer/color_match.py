"""Matcheo de colores de la imagen contra la paleta de hilos, usando distancia
perceptual en espacio CIE-Lab (mucho mejor que distancia RGB cruda)."""

import numpy as np
from skimage import color as skcolor

from .palette import THREADS

_thread_lab = None


def _threads_lab():
    """Lab de cada hilo de la paleta (cacheado)."""
    global _thread_lab
    if _thread_lab is None:
        rgb = np.array([t["rgb"] for t in THREADS], dtype=np.float64) / 255.0
        _thread_lab = skcolor.rgb2lab(rgb.reshape(-1, 1, 3)).reshape(-1, 3)
    return _thread_lab


def rgb_to_lab(rgb_array):
    """rgb_array: (N,3) en 0..255 -> (N,3) Lab."""
    arr = np.asarray(rgb_array, dtype=np.float64) / 255.0
    return skcolor.rgb2lab(arr.reshape(-1, 1, 3)).reshape(-1, 3)


def nearest_thread_index(rgb):
    """Devuelve el índice del hilo más parecido a un color RGB (0..255)."""
    lab = rgb_to_lab(np.array([rgb]))[0]
    d = np.sum((_threads_lab() - lab) ** 2, axis=1)
    return int(np.argmin(d))


def nearest_thread_indices(rgb_array):
    """Vectorizado: para cada color devuelve el índice del hilo más parecido."""
    labs = rgb_to_lab(rgb_array)                 # (N,3)
    tl = _threads_lab()                          # (M,3)
    # distancia^2 entre cada color (N) y cada hilo (M)
    d = ((labs[:, None, :] - tl[None, :, :]) ** 2).sum(axis=2)  # (N,M)
    return np.argmin(d, axis=1)
