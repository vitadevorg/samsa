# Tarjetas flotantes de la sección profesionales sin superposición

Rama: `style/tarjetas-flotantes-profesionales`

## Qué se implementó

En la Home sin sesión, la sección para profesionales (`ProfessionalB2BSection`) muestra una tarjeta de ejemplo de la "Dra. Elena Villarroel" con dos tarjetas flotantes animadas (`animate-float`, que solo sube hasta 15 px):

* **"Ahorro de Tiempo"**, arriba a la izquierda.
* **"Nuevo turno reservado"**, abajo a la derecha.

En la revisión responsive posterior al merge del PR #34 se vio que en **mobile y tablet** las dos pisaban la tarjeta de ejemplo:

* "Ahorro de Tiempo" tapaba el nombre "Dra. Elena" y la parte de arriba de la foto (unos 8 px en tablet y bastante más en mobile).
* "Nuevo turno reservado" tapaba entre 13 y 28 px del botón "Reservar Turno", a lo ancho de unos 200 px.

Ahora las dos quedan por fuera del contenido de la tarjeta en todos los anchos:

* "Ahorro de Tiempo": `-top-16` (antes `-top-6`, y `sm:-top-10` desde tablet).
* "Nuevo turno reservado": `-bottom-14` (antes `-bottom-4`, y `sm:-bottom-6` desde tablet).
* Se mantiene el corrimiento lateral desde `sm` (`sm:-left-6` y `sm:-right-6`).

Solo cambian esas dos posiciones: el resto de la sección y su animación quedan igual.

## Archivos clave tocados

* `src/components/ProfessionalB2BSection.jsx`: posición de las dos tarjetas flotantes.

## Validación

Automática:

* `npm run lint`: sin errores en `src` y `api`.
* `npm run build`: compila (queda la advertencia de tamaño del bundle, que ya existía).

Manual (`npm run dev`, Home sin sesión → sección "Para Profesionales de la Salud"), en **Mobile 360 y 375 px, Tablet 768 px y Desktop 1280 px**:

1. Medidas con las tarjetas en reposo y sumando los 15 px de la animación:
   * "Ahorro de Tiempo" queda a 23 px del nombre y a 25 px de la foto en mobile, y a 15 px y 17 px en tablet y desktop. No toca el párrafo de arriba ni en el punto más alto de la animación.
   * "Nuevo turno reservado" queda, en el punto más alto de la animación, 12 px por debajo del botón "Reservar Turno" en mobile y 4 px en tablet y desktop. En mobile queda a 8 px del bloque siguiente y en desktop a 69 px del bloque de reseñas.
2. La tercera tarjeta flotante ("Nuevos Pacientes", solo desde 1280 px) no cambia y queda a 16 px de la columna derecha.
3. La Home completa no tiene elementos fuera de pantalla ni scroll horizontal en ningún ancho.
