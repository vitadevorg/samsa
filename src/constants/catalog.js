export const SPECIALTIES = [
  "Cardiología", "Clínica Médica", "Dermatología", "Diagnóstico",
  "Endocrinología", "Fonoaudiología", "Ginecología", "Hemoterapia",
  "Infectología", "Kinesiología", "Neumonología", "Neurología",
  "Nutrición", "Odontología", "Oftalmología", "Pediatría",
  "Psicología", "Psiquiatría", "Radiología", "Traumatología", "Urología",
];

export const INSURANCES = [
  "Prensa", "Subsidio de Salud", "OSDE", "Swiss Medical",
  "Galeno", "PAMI", "IOS", "OSECAC",
];

// Para formularios donde el paciente puede no tener cobertura.
export const INSURANCE_OPTIONS = ["Ninguna", ...INSURANCES];

export const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
