# Responsive de la pantalla principal del médico (`/doctor/turns`)

Rama: `style/responsive-general`

## Qué se implementó

Ajustes de responsive en `DoctorTurns.jsx` (cabecera, tarjetas de turnos y modal "Cierre de Consulta"):

- **Cabecera de bienvenida:** padding y títulos escalan por breakpoint (`text-2xl` en mobile) y el nombre largo ya no desborda (`break-words`). Los tres contadores (En Espera, Atendidos, Total Hoy) se muestran siempre en una grilla de 3 columnas compactas en mobile, ocupando todo el ancho hasta `lg`.
- **Tarjetas de turno:** pasan a layout horizontal recién desde `lg` (antes `md`), porque en tablet las tres columnas dejaban poco lugar al paciente. En mobile y tablet la hora va en una franja superior y el botón de acción ocupa todo el ancho. El badge de estado y los datos del paciente pueden envolver a otra línea.
- **Turno "Atendiendo":** se quitó `scale-[1.01]`, que producía un desborde horizontal mínimo; se mantiene el resalte con anillo.
- **Modal de cierre de consulta:** márgenes y paddings reducidos en mobile, chips del paciente que envuelven, botones de pie y de confirmación apilados a ancho completo en pantallas chicas.
- **Raíz de la página:** `overflow-x-clip` (sin romper el header fijo, ver `docs/design-system.md`).

## Archivos clave tocados

- `src/pages/doctor/DoctorTurns.jsx`

## Validación

Automática:
- `npm run lint`: sin errores.
- `npm run build`: compila limpio.

Manual (`npm run dev`, login con un médico del seed local):
1. Abrir `/doctor/turns` y revisar cabecera, turnos de hoy y agenda futura.
2. Pulsar "Finalizar" en el turno en atención y revisar el modal.

Anchos revisados: mobile 375 px y tablet 768 px (sin scroll horizontal, sin contenido recortado) y desktop 1366 px (sin cambios visuales).
