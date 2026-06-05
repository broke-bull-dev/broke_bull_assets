# 🧵 Embroidery Studio

App web standalone para convertir **logos / imágenes de colores planos** en
archivos **`.DST` (Tajima)** listos para bordar en tu **Bai de 15 agujas**.

- Detecta los colores de la imagen y los mapea a una **paleta de hilos Madeira**.
- Genera el relleno, el contorno y el underlay, separando un **bloque de color
  por aguja** (con STOP entre colores).
- Te da una **vista previa** del bordado y una **hoja de secuencia de colores**
  para saber qué hilo va en qué aguja.

> ⚠️ **Importante:** esto funciona muy bien con **logos, dibujos, texto e
> imágenes de pocos colores definidos**. Las **fotos** con sombras y degradados
> quedan sólo aproximadas: el hilo no reproduce degradados finos. Para fotos
> realistas hace falta digitalización manual (Wilcom y similares).

---

## Instalación

```bash
cd embroidery-studio
pip install -r requirements.txt
python app.py
```

Abrí **http://localhost:5000** en el navegador.

## Cómo se usa

1. Subí un logo (PNG/JPG). Si tiene fondo transparente o un fondo plano, se
   detecta y **no se borda**.
2. Ajustá:
   - **Ancho (mm):** tamaño físico del bordado.
   - **Colores:** cuántos colores usar (máximo 15 = tus agujas).
   - **Densidad:** separación entre líneas de relleno (0.40 mm es un buen punto).
   - **Largo de puntada**, **ángulo de relleno**.
   - **Quitar fondo / Contorno / Underlay** (recomendado dejarlos activados).
3. **Generar .DST** → mirás la vista previa.
4. Descargás:
   - **`.dst`** → lo cargás en la Bai (USB).
   - **`secuencia.txt`** → te dice, en orden, qué color/hilo Madeira asignar a
     cada aguja.

## Tu paleta de hilos

El matcheo de color usa la tabla de `digitizer/palette.py`. Los RGB son una
referencia estándar bien distribuida (no los hex oficiales exactos de Madeira).

**Para usar tus conos reales:** editá `THREADS` en ese archivo con tus colores
`(code, name, (r, g, b))`. Cuanto más fiel sea esa tabla a tus hilos reales,
más fiel queda el bordado a la imagen.

## Cómo funciona (pipeline)

```
imagen → cuantización de color (≤15) → matcheo a hilos (CIE-Lab) →
máscara por color → relleno scanline en serpentina + contorno + underlay →
codificación DST (pyembroidery)
```

- `digitizer/palette.py` — paleta de hilos.
- `digitizer/color_match.py` — matcheo perceptual de color (Lab).
- `digitizer/stitches.py` — generación de puntadas (relleno y contorno).
- `digitizer/core.py` — orquestación + exportación a DST + preview.
- `app.py` — servidor web Flask.

### Uso desde Python (sin la web)

```python
from digitizer import digitize, Options
res = digitize(open("logo.png","rb").read(), Options(width_mm=90, max_colors=6))
open("logo.dst","wb").write(res.dst_bytes)
print(res.sequence_txt)
```

## Consejos de calidad

- Imágenes **limpias y de pocos colores** dan los mejores resultados.
- Para letras chicas, subí el tamaño o bajá la cantidad de colores.
- Bordados muy grandes + densidad alta = muchísimas puntadas (más lento).
- Probá distintos **ángulos de relleno** según la forma.
- Hacé siempre una **prueba en tela de descarte** antes de la prenda final.
