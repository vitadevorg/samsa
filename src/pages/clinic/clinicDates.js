// Funciones de fechas compartidas por las pantallas de clínica.
// Las fechas se guardan como texto "AAAA-MM-DD": así se pueden comparar con < y >.

// Fecha de hoy en formato "AAAA-MM-DD" (hora local).
export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// "2026-09-22" -> "22/09/2026"
export const formatDate = (isoDate) => isoDate.split('-').reverse().join('/');
