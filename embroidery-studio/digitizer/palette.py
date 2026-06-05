"""
Paleta de hilos estándar (estilo Madeira Polyneon).

Cada entrada tiene:
  - code: número de catálogo (referencia para comprar el cono)
  - name: nombre del color
  - rgb:  (r, g, b) aproximado del hilo

IMPORTANTE: estos valores RGB son una referencia razonable y bien distribuida
sobre todo el espectro para que el "matcheo" de colores funcione bien. No son
los hexadecimales oficiales exactos de Madeira (que varían según lote y pantalla).
Podés editar libremente esta lista, agregar tus conos reales o reemplazarla
entera por la paleta de tu proveedor. El algoritmo de matcheo usa estos RGB,
así que cuanto más fiel sea esta tabla a tus hilos reales, mejor el resultado.

Para usar TU paleta: reemplazá la lista THREADS por tus colores
(code, name, rgb) y listo.
"""

# (code, name, (r, g, b))
_RAW = [
    # --- Neutros ---
    ("1800", "Blanco", (255, 255, 255)),
    ("1801", "Blanco Hueso", (243, 240, 228)),
    ("1811", "Crema", (240, 228, 196)),
    ("1701", "Gris Perla", (210, 210, 208)),
    ("1702", "Gris Plata", (176, 176, 178)),
    ("1703", "Gris Acero", (128, 130, 134)),
    ("1704", "Gris Carbón", (84, 86, 90)),
    ("1718", "Negro", (20, 20, 22)),
    ("1640", "Negro Puro", (0, 0, 0)),

    # --- Rojos / vinos ---
    ("1747", "Rojo Fuego", (220, 36, 38)),
    ("1839", "Rojo Escarlata", (196, 24, 40)),
    ("1748", "Rojo Sangre", (158, 22, 34)),
    ("1984", "Vino Bordó", (110, 24, 40)),
    ("1751", "Coral", (240, 96, 80)),
    ("1755", "Salmón", (246, 140, 120)),

    # --- Rosas / fucsias ---
    ("1921", "Rosa Bebé", (248, 196, 210)),
    ("1922", "Rosa Chicle", (242, 120, 168)),
    ("1909", "Fucsia", (214, 36, 124)),
    ("1910", "Magenta", (190, 24, 120)),
    ("1986", "Púrpura", (120, 28, 96)),

    # --- Naranjas / tierras ---
    ("1678", "Naranja", (244, 120, 32)),
    ("1679", "Mandarina", (248, 150, 40)),
    ("1834", "Calabaza", (224, 96, 28)),
    ("1958", "Terracota", (172, 80, 52)),
    ("1657", "Ocre", (196, 140, 56)),

    # --- Amarillos ---
    ("1624", "Amarillo Limón", (248, 232, 70)),
    ("1571", "Amarillo Oro", (250, 204, 44)),
    ("1670", "Amarillo Maíz", (244, 214, 96)),
    ("1670b", "Dorado", (200, 160, 52)),

    # --- Verdes ---
    ("1701g", "Verde Lima", (162, 204, 60)),
    ("1748g", "Verde Manzana", (108, 184, 64)),
    ("1751g", "Verde Pasto", (56, 156, 64)),
    ("1703g", "Verde Bosque", (28, 104, 56)),
    ("1314", "Verde Oliva", (104, 116, 52)),
    ("1232", "Verde Menta", (140, 210, 176)),
    ("1294", "Verde Esmeralda", (16, 140, 110)),
    ("1295", "Verde Petróleo", (20, 100, 100)),

    # --- Azules / celestes ---
    ("1232b", "Celeste Cielo", (140, 198, 232)),
    ("1133", "Celeste", (84, 168, 224)),
    ("1134", "Azul Cobalto", (32, 96, 196)),
    ("1166", "Azul Royal", (28, 64, 168)),
    ("1043", "Azul Marino", (24, 40, 96)),
    ("1075", "Azul Noche", (18, 28, 64)),
    ("1196", "Turquesa", (24, 168, 196)),
    ("1197", "Aqua", (60, 196, 200)),

    # --- Violetas / lilas ---
    ("1112", "Lavanda", (188, 168, 220)),
    ("1113", "Violeta", (128, 84, 188)),
    ("1114", "Púrpura Real", (88, 44, 152)),
    ("1115", "Índigo", (56, 40, 120)),

    # --- Marrones / beiges ---
    ("1058", "Beige", (214, 188, 150)),
    ("1057", "Arena", (196, 160, 116)),
    ("1059", "Camel", (168, 124, 76)),
    ("1376", "Marrón", (120, 80, 48)),
    ("1465", "Chocolate", (84, 56, 36)),
    ("1466", "Café Oscuro", (56, 38, 26)),

    # --- Metálicos / especiales (aprox.) ---
    ("9842", "Oro Metálico", (198, 168, 88)),
    ("9844", "Plata Metálica", (190, 192, 198)),
]

THREADS = [{"code": c, "name": n, "rgb": rgb} for (c, n, rgb) in _RAW]


def thread_by_code(code):
    for t in THREADS:
        if t["code"] == code:
            return t
    return None
