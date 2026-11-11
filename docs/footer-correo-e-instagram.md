# Corrección del Footer — Correo visible e Instagram

**Rama:** `style/footer-correo-e-instagram`  
**Tipo:** `style`  
**Componente afectado:** `src/components/Footer.jsx` (visible en todas las páginas que lo usan)

---

## 1. Qué se implementó

* **Correo electrónico visible** en la columna *Contacto*: `vitadev.org@gmail.com`, como enlace `mailto:`, con ícono `Mail` y mismo estilo que el resto de ítems.
* **Orden:** el correo se ubica **antes** del teléfono (`0800-SAMSA-SALUD`) y del horario.
* **Apartado "Síguenos":** se eliminaron los tres íconos placeholder sin contenido (`fb`, `tw`, `ig`) y se agregó un único ícono de **Instagram** (SVG inline, sin dependencias nuevas).
* **Vínculo:** el ícono redirige al perfil oficial `https://www.instagram.com/vitadev.ar` en una pestaña nueva (`target="_blank"` + `rel="noopener noreferrer"`) con `aria-label` accesible.
* Las constantes `CONTACT_EMAIL` e `INSTAGRAM_URL` quedan definidas al inicio del componente.

---

## 2. Archivos clave tocados

| Archivo | Cambio |
|---------|--------|
| `src/components/Footer.jsx` | Nuevo ítem de correo antes del teléfono, ícono de Instagram enlazado y eliminación de íconos vacíos. |

---

## 3. Validación

### Verificación Automática
```bash
npm run lint
npm run build
```

### Prueba Manual Local
1. Abrir `http://localhost:5173/` y bajar hasta el footer (probar también tema claro, ej. `/about`).
2. Verificar que en *Contacto* el correo aparece primero, luego el teléfono y el horario.
3. Verificar que en *Síguenos* hay un solo ícono (Instagram) y que al hacer clic abre el perfil `vitadev.ar` en una pestaña nueva.
4. Revisar en Mobile (`360px`), Tablet (`768px`) y Desktop (`1280px+`) que el correo no genere scroll horizontal.
