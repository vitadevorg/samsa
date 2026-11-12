# Reducir cantidad de tarjetas por fila en Profesionales

Rama: `style/reducir_cantidad_tarjetas`

## Qué se implementó

En el panel de **Profesionales** (`/professionals`), la grilla de tarjetas de profesionales pasó de **3 columnas** (en pantallas `xl`, ≥1280px) a **2 columnas** como máximo.

Comportamiento responsive resultante:

| Dispositivo | Ancho | Columnas |
|-------------|-------|----------|
| Mobile | < 768px | 1 |
| Tablet y Desktop | ≥ 768px | 2 |

Solo se quitó la clase `xl:grid-cols-3` de la grilla. No se modificaron los datos, el contenido de las tarjetas (`DoctorCard`), los filtros ni la grilla interna de 3 columnas de horarios dentro de cada tarjeta.

## Archivos clave tocados

- `src/pages/Professionals.jsx` (grilla de tarjetas: `grid-cols-1 md:grid-cols-2 gap-6`)
- `docs/reducir-cantidad-tarjetas.md` (este documento)
- `docs/INDEX.md` (registro)

## Validación

Automática:
- `npm run lint` → sin errores.
- `npm run build` → compila limpio.

Manual local (`npm run dev`, abrir `http://localhost:5173/professionals`):
1. Desktop (1280px+): las tarjetas se muestran de a 2 por fila.
2. Tablet (712px–768px): 2 por fila, sin recortes ni scroll horizontal.
3. Mobile (360px–414px): 1 por fila.
4. Verificar que filtros, contador de resultados y datos de cada tarjeta no cambiaron.
