# 🎨 Design System y Estándares UI/UX — SAMSA

Documento oficial de estilo visual, componentes, animaciones y criterios responsive del sistema **SAMSA**. Todo desarrollo o mejora en el frontend debe respetar estos lineamientos para mantener coherencia en toda la aplicación.

---

## 1. Identidad Visual y Paleta de Colores

SAMSA combina dos atmósferas visuales complementarias según el público:
* **Tema Claro Clínico (Pacientes y Portal Público):** Limpio, luminoso, confiable y sin fricción (`bg-white`, `bg-slate-50`, `bg-blue-50/40`).
* **Tema Oscuro Ejecutivo (B2B Profesionales, Administración e Instituciones):** Tecnológico y de alto contraste (`bg-slate-950`, `bg-slate-900/80`).

### Tokens de Color Principales (Tailwind CSS)
* **Primario (Acción y Salud):** `blue-600` (`#2563eb`) con hover `blue-700` (`#1d4ed8`).
* **Gradiente de Marca (Títulos destacados y acentos):** `bg-gradient-to-r from-blue-600 to-indigo-600` con `text-transparent bg-clip-text`.
* **Texto Principal (Claro):** `slate-900` / `gray-900` para títulos, `slate-800` para cuerpo destacado.
* **Texto Secundario:** `slate-500` / `gray-500` para descripciones y bajadas.
* **Bordes y Divisores Suaves:** `border-slate-100`, `border-gray-100`, `border-blue-100` (en estados activos o destacados).
* **Estados Semánticos:**
  * Éxito / Activo: `emerald-500` / `emerald-600`
  * Advertencia / Pendiente: `amber-500`
  * Peligro / Baja: `red-500` / `rose-600`

---

## 2. Tipografía y Jerarquía

Toda la interfaz utiliza `font-sans` con la siguiente escala jerárquica:

* **Hero H1 (Páginas públicas):**
  * Clases: `text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.15] sm:leading-[1.1]`
* **Títulos de Sección (H2 / H3):**
  * Clases: `text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900` o `text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900`
* **Títulos de Tarjetas (H3):**
  * Clases: `text-lg sm:text-xl font-bold text-gray-900` (mantener siempre la misma familia y peso entre secciones de una misma vista, sin `tracking-tight` forzado en títulos chicos).
* **Descripciones de Tarjetas y Párrafos:**
  * Clases: `text-gray-500 text-sm sm:text-base leading-relaxed`
* **Contadores y Métricas:**
  * Clases: `font-mono tracking-tighter font-bold text-3xl sm:text-4xl lg:text-5xl text-gray-900`

---

## 3. Botones (CTAs)

### Botón Primario (Estilo SAMSA Hero)
Usado para acciones principales como *"Solicitar turno"*, *"Agendar Turno"* o *"Solicitar mi turno ahora"*:
```jsx
<Link
  to="/turns"
  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 sm:px-8 sm:py-4 border border-transparent text-base font-bold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 md:text-lg transition-all transform hover:-translate-y-1 shadow-lg shadow-blue-500/30 group"
>
  Solicitar turno
  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
</Link>
```

### Botón Secundario
Usado para acciones complementarias como *"Conocer más"*:
```jsx
<a
  href="#care-flow"
  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 sm:px-8 sm:py-4 border border-slate-200 text-base font-bold rounded-2xl text-slate-700 bg-white hover:bg-slate-50 md:text-lg transition-all hover:shadow-md"
>
  Conocer más
</a>
```

---

## 4. Tarjetas y Superficies (Glassmorphism)

* **Bordes redondeados:** `rounded-3xl` (`1.5rem`) en mobile y `sm:rounded-[2rem]` (`2rem`) en desktop.
* **Elevación y Sombras:**
  * Reposo: `bg-white/90 border border-slate-100/90 shadow-lg shadow-slate-900/[0.04]`
  * Activa / Hover: `bg-white border-blue-200/90 shadow-[0_20px_50px_-15px_rgba(37,99,235,0.18)] -translate-y-1 sm:-translate-y-2.5`
* **Insignias numéricas en pasos/nodos:**
  * **Estado pendiente (aún no alcanzado por la animación):** Círculo blanco con número azul y contorno celeste (`bg-white text-blue-600 border-2 border-blue-200 ring-2 ring-white shadow-sm`).
  * **Estado activo o completado:** Círculo azul sólido con número blanco y borde blanco (`bg-blue-600 text-white border-2 border-white shadow-md shadow-blue-600/30 scale-110`).

---

## 5. Animaciones y Micro-interacciones

* **Aparición en scroll (`FadeIn` / `Reveal`):**
  * Usar `src/components/FadeIn.jsx` o `src/components/Reveal.jsx` basados en `useInView`.
  * Cuando haya líneas conectoras detrás de tarjetas animadas con `FadeIn`, aplicar `transitionDelay` (ej. `900ms`) a la opacidad de la línea para que nunca se renderice antes de que las tarjetas terminen de entrar en su posición.
* **Progresión automática interactiva:**
  * Pausar cualquier temporizador automático (`setInterval`) cuando el usuario hace hover (`onMouseEnter` / `onMouseLeave`) y permitir selección manual mediante clic/tap.

---

## 6. Reglas de Responsiveness (Mobile, Tablet y Desktop)

1. **Sin desbordes horizontales:** El contenedor raíz de cada página debe incluir `overflow-x-hidden` cuando existan halos o elementos decorativos absolutos (`blur-3xl`).
2. **Orden de lectura en Hero (Mobile y Tablet `< lg`):**
   * **1° (`order-1`):** Título principal + párrafo descriptivo centrados (`text-center lg:text-left`).
   * **2° (`order-2`):** Imagen principal debajo del texto.
   * **3° (`order-3`):** Botones de acción (`w-full sm:w-auto`) debajo de la imagen.
   * En Desktop (`lg+`), título y botones se agrupan a la izquierda (`lg:col-start-1`) y la imagen ocupa la columna derecha (`lg:col-start-2 lg:row-span-2`).
3. **Imágenes con personas/rostros:**
   * En mobile y tablet usar relación de aspecto controlada (`aspect-[4/3] max-w-xl mx-auto`) con `object-cover object-top` y `scale-100` para evitar que se recorten las cabezas o rostros en resoluciones intermedias como tablets (`712px - 768px`).
4. **Espaciado bajo el Navbar:**
   * Como `Navbar` es `sticky top-0` (ocupa `h-20` en el flujo normal del documento), el bloque inmediatamente inferior debe usar un padding superior moderado (`pt-8 sm:pt-12 lg:pt-16`) para evitar huecos blancos excesivos.
