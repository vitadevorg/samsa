// Formato de lectura de los registros de la HCE: lo usan la tarjeta, el resumen y la copia impresa,
// así todos muestran lo mismo y en el mismo orden.
import { ENTRY_TYPES, SELECT_OPTIONS, VITAL_SIGNS, optionLabel } from '../constants/hce';

// "TA 150/95 mmHg · FC 82 lpm · SatO₂ 97 %" (solo los signos cargados).
export const formatVitals = (vitals) =>
  VITAL_SIGNS.filter((v) => String(vitals?.[v.key] ?? '').trim())
    .map((v) => `${v.short} ${String(vitals[v.key]).trim()} ${v.unit}`)
    .join(' · ');

export const vitalsList = (vitals) =>
  VITAL_SIGNS.filter((v) => String(vitals?.[v.key] ?? '').trim())
    .map((v) => ({ key: v.key, short: v.short, value: String(vitals[v.key]).trim(), unit: v.unit, label: v.label }));

// Filas de lectura del registro en el orden del formulario, sin campos vacíos.
// Cada fila: { name, label, hint, soap, kind, value, code }.
export const entryRows = (entry) => {
  const config = ENTRY_TYPES[entry.type];
  if (!config) return [];
  return config.fields
    .map((field) => {
      const raw = entry.data[field.name];
      let value = raw;
      if (field.kind === 'vitals') value = formatVitals(raw);
      else if (field.kind === 'select' && SELECT_OPTIONS[field.options]) value = optionLabel(field.options, raw);
      const code = config.codedField === field.name ? entry.data.code : undefined;
      return { name: field.name, label: field.label, hint: field.hint, soap: field.soap, kind: field.kind, value: String(value ?? '').trim(), code, raw };
    })
    .filter((row) => row.value || row.code);
};

// Título corto del registro (motivo de consulta, fármaco, estudio...).
export const entryHeadline = (entry) => {
  const config = ENTRY_TYPES[entry.type];
  const row = entryRows(entry).find((r) => r.name === config?.headline);
  return row?.value ?? '';
};

// Texto plano para el buscador de la historia.
export const entrySearchText = (entry) =>
  [ENTRY_TYPES[entry.type]?.label, entry.professional.name, ...entryRows(entry).map((r) => `${r.value} ${r.code ?? ''}`)]
    .join(' ')
    .toLowerCase();
