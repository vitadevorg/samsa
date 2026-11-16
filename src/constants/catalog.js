export const SPECIALTIES = [
  "Cardiología", "Clínica Médica", "Dermatología", "Diagnóstico",
  "Endocrinología", "Fonoaudiología", "Ginecología", "Hemoterapia",
  "Infectología", "Kinesiología", "Neumonología", "Neurología",
  "Nutrición", "Odontología", "Oftalmología", "Pediatría",
  "Psicología", "Psiquiatría", "Radiología", "Traumatología", "Urología",
];

// Estudios que puede realizar una institución, agrupados por tipo.
export const STUDY_GROUPS = {
  "Laboratorio": ["Análisis clínicos", "Hemograma completo", "Perfil lipídico", "Glucemia", "Hemoglobina glicosilada", "Perfil tiroideo", "Orina completa", "Cultivos"],
  "Imágenes": ["Radiografía", "Ecografía", "Ecografía Doppler", "Mamografía", "Densitometría", "Tomografía computada", "Resonancia magnética"],
  "Cardiología": ["Electrocardiograma", "Ecocardiograma", "Ergometría", "Holter", "Presurometría (MAPA)"],
  "Otros": ["Endoscopía", "Colonoscopía", "Espirometría", "Electroencefalograma", "Audiometría", "Papanicolaou y colposcopía"],
};

export const STUDIES = Object.values(STUDY_GROUPS).flat();

export const INSURANCES = [
  "Prensa", "Subsidio de Salud", "OSDE", "Swiss Medical",
  "Galeno", "PAMI", "IOS", "OSECAC",
];

// Para formularios donde el paciente puede no tener cobertura.
export const INSURANCE_OPTIONS = ["Ninguna", ...INSURANCES];

export const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
