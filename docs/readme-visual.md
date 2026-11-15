# README visual de S.A.M.S.A.

## Qué se implementó

Se actualizó la portada del repositorio con una galería del portal público y de los siete módulos por rol. Los diagramas Mermaid describen el enrutamiento, el estado compartido y la validación de afiliación. Los pasos de instalación siguen el lockfile y el requisito de Node.js de Vite.

## Archivos modificados y creados

| Archivo | Responsabilidad |
| --- | --- |
| [README.md](../README.md) | Presentación del producto, galería, diagramas y ejecución local. |
| [docs/assets/readme/](assets/readme/) | Capturas WebP de la aplicación con cuentas de demostración. |
| [docs/INDEX.md](INDEX.md) | Entrada a la documentación de esta entrega. |

## Validación

- Ejecutar `npm run lint` y `npm run build`.
- Las 17 vistas de escritorio se capturaron a 1440 × 920 px. El portal se comprobó además a 390 × 844 px y 768 × 1024 px, sin desbordamiento horizontal.
- Iniciar `npm run dev` y abrir `http://localhost:5173/`. En `/login`, ingresar con las cuentas de demostración del servicio de autenticación y abrir las rutas indicadas en la galería.
- En la vista renderizada del README, comprobar que los enlaces de la cabecera lleven a su sección, que cada captura abra el archivo correspondiente y que se vean los dos diagramas. Revisar la lectura y el ajuste de la galería a 390 px, 768 px y 1440 px.
