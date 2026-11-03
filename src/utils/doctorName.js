// Nombre con el que se saluda a un médico: título y apellido, por ejemplo "Dra. Gómez".
// El título ("Dr.", "Dra.", "Lic.") viene en `user.title`; si la cuenta no lo tiene se usa "Dr.".
// `user.name` puede traer o no el título adelante: se ignora.
const TITLE_PATTERN = /^(Dr|Dra|Lic)\.\s+/;

// "Dra. Priscila Gómez" -> "Dra."   ·   "Priscila Gómez" -> undefined
export const getTitleFromName = (name) => name.match(TITLE_PATTERN)?.[1] && `${name.match(TITLE_PATTERN)[1]}.`;

export const stripTitle = (name) => name.replace(TITLE_PATTERN, '');

export const getDoctorLabel = (user) => {
  const words = stripTitle((user?.name ?? '').trim()).split(/\s+/).filter(Boolean);
  const lastName = words[words.length - 1] ?? '';
  return `${user?.title ?? getTitleFromName(user?.name ?? '') ?? 'Dr.'} ${lastName}`.trim();
};
