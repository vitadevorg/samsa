# Tarjeta Trello #55 — Corrección de Redundancia, Textos y Responsiveness en Preguntas Frecuentes

**Tarjeta:** [`samsa_style. redundancia_panel_preguntas_frecuentes`](https://trello.com/c/7pf8r0bv)  
**Rama:** `style/redundancia-panel-preguntas-frecuentes`  
**Tipo:** `style`  
**Vista afectada:** `/faq` (`src/pages/FAQ.jsx`)

---

## 1. Qué se implementó

### A. Corrección de Textos y Redundancias en el Panel de Preguntas Frecuentes
* **Pregunta `02` (`¿Qué datos se solicitan para el registro del paciente?`):**
  * Se eliminaron las aclaraciones redundantes `"(confirmándolo dos veces)"` y `"(con al menos una mayúscula y un carácter especial)"` y se alinearon los campos con el formulario real de registro (`Register.jsx`).
  * **Texto final:** *"Para registrarte debés completar un formulario con: Nombre, Apellido, DNI, CUIL (opcional), Fecha de nacimiento, Teléfono, Obra Social, Correo electrónico y una contraseña segura."*
* **Pregunta `03` (`¿Cómo es el proceso de recuperación de contraseña?`):**
  * Se actualizó la respuesta para reflejar el flujo real de recuperación por correo electrónico (`ForgotPassword.jsx` / `ResetPassword.jsx`).
  * **Texto final:** *"Si olvidaste tu contraseña, debés usar la opción de recuperar. Recibirás un mail con instrucciones para restablecer la contraseña y recuperar el acceso a tu cuenta."*
* **Eliminación de pregunta redundante:**
  * Se eliminó la pregunta *"¿La app es accesible desde cualquier dispositivo?"* y se renumeraron las preguntas siguientes de forma correlativa (`01` a `07`).
* **Pregunta `04` (ex `05` — `¿Es segura la información que ingreso en la app?`):**
  * Se eliminó la oración final *"El acceso está protegido por contraseña y verificación de email."*
  * **Texto final:** *"Sí, toda la información personal y médica se almacena en servidores seguros cumpliendo normativas de protección de datos."*
* **Pregunta `05` (ex `06` — `¿La app me avisa si mi turno se cancela o se atrasa?`):**
  * Se actualizó la respuesta indicando que el paciente recibe la alerta en su método de contacto.
  * **Texto final:** *"Sí. Si tu turno se cancela o sufre una demora imprevista, recibirás una notificación directamente en tu método de contacto."*

### B. Mejoras de Responsiveness y Espaciado Superior
* **Espacio entre Header y Título:** Se redujo el padding superior excesivo (`pt-32 lg:pt-40` → `pt-8 pb-10 sm:pt-12 sm:pb-14 lg:pt-16 lg:pb-20`) ya que el `Navbar` es `sticky` y ocupa su propio alto.
* **Adaptación Mobile / Tablet (`360px` a `768px`):**
  * Prevención de scroll horizontal (`overflow-x-hidden`).
  * Escalado fluido de título (`text-3xl sm:text-5xl lg:text-6xl`) y subtítulo (`text-base sm:text-xl`).
  * Acordeones con paddings e indentación adaptativos en mobile (`p-4 sm:p-6`, `pl-10 sm:pl-[4.5rem]`, `text-sm sm:text-base`) para aprovechar mejor el ancho en pantallas chicas.
  * Tarjeta inferior de contacto (*"¿No encontraste lo que buscabas?"*) con botones apilados a ancho completo en mobile (`flex-col sm:flex-row`, `w-full sm:w-auto`).

---

## 2. Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `src/pages/FAQ.jsx` | Corrección de textos en `faqs`, eliminación de pregunta redundante, renumeración `01-07`, reducción de espacio superior bajo el header y mejoras responsive para mobile y tablet. |
| `src/components/Navbar.jsx` | Cambio del breakpoint del menú hamburguesa de `md` (`768px`) a `lg` (`1024px`) y prevención de quiebres de línea (`whitespace-nowrap`) para evitar que en tablets de `800px` (ej. Galaxy Tab S9) se apilen los enlaces del header. |

---

## 3. Validación

### Verificación Automática
```bash
npm run lint
npm run build
```
* Ambos comandos finalizan con código `0` sin errores.

### Prueba Manual Local
1. Abrir `http://localhost:5173/faq`.
2. Verificar el espaciado reducido entre el `Navbar` y el ícono/título de **Preguntas Frecuentes**.
3. Desplegar las preguntas `02`, `03`, `04` y `05` y comprobar que los textos actualizados se muestren correctamente y la numeración vaya del `01` al `07`.
4. Verificar en vista Mobile (`402x874` / `360px`) y Tablet (`712x1138`) la legibilidad de los acordeones y los botones de soporte a ancho completo.
