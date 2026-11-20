# Guía y Prompt para Carruseles de Instagram — SAMSA / VitaDev

Guía oficial y plantilla de prompt para que todos los integrantes del equipo generen carruseles de Instagram con una identidad visual, narrativa y editorial unificada, alineada con el [`Design System de SAMSA`](./design-system.md) y el símbolo vectorial oficial ([`public/favicon.svg`](../public/favicon.svg)).

---

## 1. Paleta de Colores Oficial (SAMSA Web)

Los colores utilizados en las piezas gráficas de SAMSA coinciden con los tokens de Tailwind CSS definidos en la aplicación web:

| Rol | Token Tailwind | Código HEX | Uso en las láminas |
|---|---|---|---|
| **Azul Primario** | `blue-600` | `#2563EB` | Palabras destacadas en títulos, líneas conectoras, círculos de nodos activos e íconos principales. |
| **Azul Profundo** | `blue-700` | `#1D4ED8` | Transición intermedia del símbolo de marca y contrastes sobre azul. |
| **Índigo de Marca** | `indigo-700` / `indigo-600` | `#4338CA` / `#4F46E5` | Remate del degradé del logo (`#2563EB` -> `#1D4ED8` -> `#4338CA`) y acentos de marca. |
| **Superficie Celeste Suave** | `blue-100` / `blue-50` | `#DBEAFE` / `#EFF6FF` | Círculos secundarios, fondos suaves de apoyo y bloques de transición. |
| **Fondo Principal (Claro Clínico)** | `white` / `slate-50` | `#FFFFFF` / `#F8FAFC` | Fondo base limpio y luminoso de las láminas. |
| **Fondo Oscuro Ejecutivo (Opcional B2B)** | `slate-950` / `slate-900` | `#020617` / `#0F172A` | Láminas puntuales de alto contraste orientadas a instituciones o cierre técnico. |
| **Texto Principal (Títulos)** | `slate-900` | `#0F172A` | Títulos principales, palabra "SAMSA" y numeración de página. |
| **Texto Cuerpo / Bajadas** | `slate-800` / `slate-600` | `#1E293B` / `#475569` | Párrafos explicativos, etiquetas de nodos y firma "por VitaDev". |

### Activos de Marca en el Repositorio
* **Símbolo oficial de SAMSA (SVG):** [`public/favicon.svg`](../public/favicon.svg) (o componente [`src/components/SamsaLogo.jsx`](../src/components/SamsaLogo.jsx)), con proporción `128 × 103` y degradé lineal `#2563EB` -> `#1D4ED8` -> `#4338CA`.
* **Encabezado estándar de lámina:** Símbolo de SAMSA + texto `SAMSA` en `#0F172A` a la izquierda, y firma `por VitaDev` alineada a la derecha.
* **Pie estándar de lámina:** Numeración discreta en esquina inferior derecha con formato `01/06`, `02/06`, etc.

---

## 2. Prompt Listo para Copiar y Usar

Copiá el siguiente bloque completo y pegalo en la herramienta de diseño o asistente de IA junto con el archivo [`public/favicon.svg`](../public/favicon.svg) (o una lámina de referencia del repositorio):

```markdown
Diseñá un carrusel de Instagram para SAMSA (por VitaDev).

### 1. ANTES DE DISEÑAR
Consultá al usuario estas 3 preguntas y esperá sus respuestas antes de generar el carrusel:
1. ¿Sobre qué tema querés hacer el carrusel y qué mensaje principal querés transmitir?
2. ¿Cuántas láminas querés que tenga? (Si no está definido, proponé una cantidad acorde al contenido y explicá brevemente por qué).
3. ¿A quién está dirigido (pacientes, médicos, clínicas/hospitales o público general) y qué acción querés que realice al terminar de verlo?

### 2. IDENTIDAD VISUAL Y PALETA OFICIAL (SAMSA)
Respetá estrictamente el logo oficial de SAMSA sin deformarlo ni alterar sus proporciones, y utilizá únicamente la paleta oficial del sistema web:
- Fondo base: Blanco puro (`#FFFFFF`) o blanco clínico muy sutil (`#F8FAFC`).
- Azul primario (acentos, palabras clave en títulos, líneas e íconos): `#2563EB`.
- Degradé oficial del símbolo SAMSA: `#2563EB` -> `#1D4ED8` -> `#4338CA`.
- Superficies secundarias y círculos de apoyo: Celeste suave `#DBEAFE` y `#EFF6FF`.
- Títulos y texto principal: Azul pizarra oscuro `#0F172A`.
- Párrafos y etiquetas secundarias: `#1E293B` o `#475569`.
(Si el carrusel es exclusivo de VitaDev como equipo y no de SAMSA, pedí los códigos HEX o el logo de VitaDev antes de empezar).

### 3. ESTILO EDITORIAL
Diseño limpio, moderno y editorial:
- Amplio espacio en blanco y composición equilibrada.
- Tipografía sans-serif geométrica moderna (estilo Inter / Plus Jakarta Sans):
  - Títulos en bold/extrabold en `#0F172A`, destacando 1 o 2 palabras clave en azul `#2563EB`.
  - Línea divisoria corta en azul `#2563EB` debajo del título cuando ayude a separar la bajada.
  - Párrafos breves, directos y de lectura cómoda en pantallas móviles.
- Una sola idea principal por lámina.
- Recursos gráficos: círculos, nodos conectados por líneas rectas o curvas suaves e íconos lineales simples en `#2563EB` o blanco sobre círculo `#2563EB` / `#DBEAFE`.
- Español argentino con ortografía, tildes y puntuación impecables.
- Prohibido: saturación visual, fotos de stock genéricas, efectos 3D, sombras pesadas o inventar datos, métricas o funcionalidades que no existan en SAMSA.

### 4. FORMATO Y MÁRGENES
- Tamaño exacto por lámina: `1080 × 1350 px` (proporción vertical `4:5`).
- Márgenes seguros: mínimo `80 px` en los cuatro lados para títulos, textos, logos y numeración.
- Encabezado fijo o consistente: Logo SAMSA a la izquierda y texto discreto "por VitaDev" a la derecha.
- Pie de lámina: numeración discreta abajo a la derecha (ej. `01/06`, `02/06`).

### 5. CONTINUIDAD ENTRE LÁMINAS
Diseñá primero toda la secuencia como un lienzo horizontal continuo (`(1080 × N) × 1350 px`) y luego dividilo en láminas individuales:
- No generes placas aisladas: creá una narrativa visual que avance al deslizar.
- Usá líneas conectoras, curvas, círculos o bloques de color `#2563EB` / `#DBEAFE` que nazcan en una lámina y continúen en la siguiente.
- Todo elemento gráfico que cruce el borde entre dos láminas debe coincidir exactamente en posición vertical (eje Y), grosor, tamaño, color y dirección.
- Solo los elementos gráficos pueden cruzar los cortes; los textos, títulos, íconos principales y logos deben quedar íntegros dentro de los márgenes seguros de cada lámina.

### 6. ESTRUCTURA DEL CONTENIDO
- Lámina 1 (Portada): Pregunta hook o frase contundente que despierte interés y motive a deslizar.
- Láminas intermedias: Desarrollo del mensaje paso a paso (del problema a la solución, flujo de atención o conexión entre roles: Pacientes, Profesionales, Instituciones) sin repetir ideas.
- Última lámina (Cierre): Conclusión clara y llamada a la acción (CTA) alineada con el objetivo del usuario.

### 7. REVISIÓN Y ENTREGA
Antes de entregar, verificá:
- Ortografía, contraste, alineación y legibilidad móvil.
- Ausencia de textos cortados o elementos superpuestos.
- Continuidad exacta en los bordes de todas las láminas contiguas.
- Dimensiones exactas de `1080 × 1350 px` por archivo.

Entregá:
1. Las láminas individuales numeradas en orden (`01`, `02`, ...).
2. Una vista panorámica del carrusel completo unido.
3. Una propuesta de copy (texto de la publicación + hashtags sobrios) para acompañar el posteo en Instagram.
```
