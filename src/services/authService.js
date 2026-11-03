import { ROLES } from '../constants/roles';

// Cuentas de demostración con datos ficticios. Esto es solo un mock:
// cuando exista backend, `login` debe llamar a la API y la validación
// de credenciales tiene que ocurrir en el servidor, nunca en el bundle.
const DEMO_ACCOUNTS = [
  {
    email: 'paciente@samsa.med',
    password: 'batman',
    user: {
      name: 'Lucía',
      lastname: 'Fernández',
      role: ROLES.PATIENT,
      dni: '30123456',
      phone: '3810000000',
      location: 'San Miguel de Tucumán',
      img: 'https://placehold.co/100x100/3B82F6/FFFFFF?text=LF',
      dob: '01/01/1990',
    },
  },
  {
    email: 'jesus.zelarayan@samsa.med',
    password: '12345',
    user: { name: 'Jesús Zelarayan', title: 'Dr.', role: ROLES.DOCTOR, img: '/img/UTN-Jesus.jpg' },
  },
  {
    email: 'admin@samsa.med',
    password: 'admin',
    user: { name: 'Administrador', role: ROLES.ADMIN },
  },
  {
    email: 'secretaria@samsa.med',
    password: '12345',
    user: {
      name: 'María González',
      role: ROLES.SECRETARY,
      img: 'https://placehold.co/100x100/ec4899/FFFFFF?text=MG',
    },
  },
  // Administradores de institución. `institutionId` indica qué institución
  // administran (ver src/data/institutions.js).
  {
    email: 'admin.clinica@samsa.med',
    password: '12345',
    user: { name: 'Carolina Medina', role: ROLES.CLINIC_ADMIN, institutionId: 'clinica-del-norte' },
  },
  {
    email: 'admin.hospital@samsa.med',
    password: '12345',
    user: { name: 'Gustavo Ibáñez', role: ROLES.HOSPITAL_ADMIN, institutionId: 'hospital-central' },
  },
  {
    email: 'vitadev@samsa.med',
    password: '12345',
    // Contacto de recuperación de la cuenta (lo edita el propio administrador en Mi cuenta).
    user: { name: 'VitaDev', role: ROLES.VITADEV_ADMIN, recoveryEmail: 'recuperacion.vitadev@samsa.med', recoveryPhone: '381 400-9000' },
  },
  // Secretaria de Clínica del Norte (figura en src/data/institutions.js como sec-1).
  {
    email: 'ana.diaz@samsa.med',
    password: '12345',
    user: {
      name: 'Ana Paula Díaz',
      role: ROLES.SECRETARY,
      img: 'https://placehold.co/100x100/ec4899/FFFFFF?text=AD',
    },
  },
  // Cuentas de prueba para el administrador de VitaDev (ver src/data/institutions.js):
  // médicos particulares, sus secretarias, otra secretaria de clínica, otro administrador
  // de clínica y dos pacientes. Sirven para probar bajas y reseteos de contraseña.
  { email: 'luis.coronel@samsa.med', password: '12345', user: { name: 'Luis Coronel', title: 'Dr.', role: ROLES.DOCTOR, img: '/img/UTN-LuisCoronel.jpg' } },
  { email: 'priscila.gomez@samsa.med', password: '12345', user: { name: 'Priscila Gómez', title: 'Dra.', role: ROLES.DOCTOR, img: '/img/UTN-Priscila.jpg' } },
  { email: 'augusto.fernandez@samsa.med', password: '12345', user: { name: 'Augusto Fernández', title: 'Dr.', role: ROLES.DOCTOR, img: '/img/UTN-Augusto.jpg' } },
  { email: 'noelia.ferreyra@samsa.med', password: '12345', user: { name: 'Noelia Ferreyra', role: ROLES.SECRETARY } },
  { email: 'tomas.acuna@samsa.med', password: '12345', user: { name: 'Tomás Acuña', role: ROLES.SECRETARY } },
  { email: 'florencia.juarez@samsa.med', password: '12345', user: { name: 'Florencia Juárez', role: ROLES.SECRETARY } },
  { email: 'admin.dermato@samsa.med', password: '12345', user: { name: 'Sergio Acosta', role: ROLES.CLINIC_ADMIN, institutionId: 'centro-dermatologico' } },
  { email: 'martin.gomez@samsa.med', password: '12345', user: { name: 'Martín', lastname: 'Gómez', role: ROLES.PATIENT } },
  { email: 'sofia.luna@samsa.med', password: '12345', user: { name: 'Sofía', lastname: 'Luna', role: ROLES.PATIENT } },
];

// Cuentas creadas en runtime por el administrador de VitaDev (médicos o secretarias nuevos,
// o personas de la clínica que todavía no tenían una cuenta de demostración).
const createdAccounts = new Map();

// Contraseñas reseteadas: email -> { password, mustChangePassword }. Tienen prioridad sobre
// la contraseña original de la cuenta, que nunca se expone.
const passwordOverrides = new Map();

const normalizeEmail = (email) => email.trim().toLowerCase();
// Emails que ya no existen porque se cambiaron por otros (ver updateAccount).
const retiredEmails = new Set();
const findAccount = (email) =>
  retiredEmails.has(email) ? undefined : createdAccounts.get(email) ?? DEMO_ACCOUNTS.find((acc) => acc.email === email);

// Todos los emails que ya tienen cuenta (para no repetirlos al dar de alta a alguien).
export const getRegisteredEmails = () => [
  ...DEMO_ACCOUNTS.map((acc) => acc.email),
  ...createdAccounts.keys(),
].filter((email) => !retiredEmails.has(email));

// Emails de cuentas dadas de baja por su institución. Es un Set (un conjunto:
// no guarda repetidos) que vive en memoria mientras la página esté abierta;
// al recargar se vacía. Con backend, esto sería un dato de la base.
const deactivatedEmails = new Set();

// Emails de cuentas inhabilitadas por VitaDev. A diferencia de la baja, es reversible:
// mientras estén acá no pueden iniciar sesión, pero se pueden volver a habilitar.
const disabledEmails = new Set();

export const disableAccount = (email) => {
  disabledEmails.add(normalizeEmail(email));
};

export const enableAccount = (email) => {
  disabledEmails.delete(normalizeEmail(email));
};

export const getDisabledEmails = () => [...disabledEmails];

// Marca una cuenta como dada de baja: ya no va a poder iniciar sesión.
export const deactivateAccount = (email) => {
  deactivatedEmails.add(normalizeEmail(email));
};

// Emails dados de baja hasta ahora (copia: quien la recibe no modifica el conjunto original).
export const getDeactivatedEmails = () => [...deactivatedEmails];

// Contraseña temporal aleatoria. Se evitan caracteres que se confunden (0/O, 1/l/I).
const TEMP_PASSWORD_ALPHABET = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const TEMP_PASSWORD_LENGTH = 10;
const generateTemporaryPassword = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(TEMP_PASSWORD_LENGTH));
  return Array.from(bytes, (byte) => TEMP_PASSWORD_ALPHABET[byte % TEMP_PASSWORD_ALPHABET.length]).join('');
};

// Asigna una contraseña temporal a una cuenta y la marca para que su dueño tenga que
// cambiarla al iniciar sesión (`mustChangePassword`). Devuelve la contraseña temporal:
// es la única vez que se muestra. La contraseña anterior no se lee ni se devuelve.
// `profile` ({ name, role, ... }) se usa solo si la persona todavía no tenía cuenta:
// así también se le crea el acceso.
export const resetPassword = (email, profile) => {
  const normalizedEmail = normalizeEmail(email);
  if (!findAccount(normalizedEmail)) {
    createdAccounts.set(normalizedEmail, { email: normalizedEmail, password: null, user: profile });
  }
  const temporaryPassword = generateTemporaryPassword();
  passwordOverrides.set(normalizedEmail, { password: temporaryPassword, mustChangePassword: true });
  return temporaryPassword;
};

// Fija una contraseña elegida por VitaDev (no se lee la anterior). Como la conoce quien la
// cargó, queda marcada para que su dueño la cambie al iniciar sesión.
export const setPassword = (email, password) => {
  passwordOverrides.set(normalizeEmail(email), { password, mustChangePassword: true });
};

// Cambia el email (el usuario), el nombre y/o otros datos del perfil de una cuenta (por ejemplo el contacto de recuperación). La contraseña, el estado de baja y la
// marca de cambio pendiente pasan al email nuevo; el anterior deja de poder iniciar sesión.
export const updateAccount = (email, { email: newEmail, name, ...profile }) => {
  const oldEmail = normalizeEmail(email);
  const nextEmail = normalizeEmail(newEmail ?? email);
  const account = findAccount(oldEmail);
  if (!account) return;
  const updated = { email: nextEmail, password: account.password, user: { ...account.user, ...(name ? { name } : {}), ...profile } };
  if (nextEmail !== oldEmail) {
    const override = passwordOverrides.get(oldEmail);
    if (override) passwordOverrides.set(nextEmail, override);
    passwordOverrides.delete(oldEmail);
    if (deactivatedEmails.delete(oldEmail)) deactivatedEmails.add(nextEmail);
    if (disabledEmails.delete(oldEmail)) disabledEmails.add(nextEmail);
    createdAccounts.delete(oldEmail);
    retiredEmails.add(oldEmail);
    retiredEmails.delete(nextEmail);
  }
  createdAccounts.set(nextEmail, updated);
};

// ¿La contraseña es la actual de la cuenta? Solo responde sí o no: nunca devuelve la contraseña.
export const verifyPassword = (email, password) => {
  const normalizedEmail = normalizeEmail(email);
  const account = findAccount(normalizedEmail);
  if (!account) return false;
  const override = passwordOverrides.get(normalizedEmail);
  return (override ? override.password : account.password) === password;
};

// Cambio de contraseña hecho por la propia persona desde su cuenta (no queda pendiente de cambio).
export const setOwnPassword = (email, password) => {
  passwordOverrides.set(normalizeEmail(email), { password, mustChangePassword: false });
};

// --- Recuperación de contraseña ("Olvidé mi contraseña") ---------------------
// Mock: no se envía ningún correo. El "enlace" se devuelve para que la pantalla de recuperación
// lo muestre como simulación. Con backend, el servidor manda el mail y nunca devuelve el token.
const RESET_LINK_TTL_MS = 30 * 60 * 1000;
const resetTokens = new Map(); // token -> { email, expiresAt }

// "juan.perez@samsa.med" -> "j***@samsa.med"
const maskEmail = (email) => email.replace(/^(.).*(@.*)$/, '$1***$2');

// Pide el enlace de recuperación. Devuelve { token, sentTo } si la cuenta existe y puede entrar, o
// null si no (la pantalla responde igual en los dos casos, para no revelar qué emails existen).
// Si la cuenta tiene un correo de recuperación propio (VitaDev), el enlace va a ese correo.
export const requestPasswordReset = async (email) => {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS / 2));
  const normalizedEmail = normalizeEmail(email);
  const account = findAccount(normalizedEmail);
  if (!account || deactivatedEmails.has(normalizedEmail) || disabledEmails.has(normalizedEmail)) return null;
  const token = crypto.randomUUID();
  resetTokens.set(token, { email: normalizedEmail, expiresAt: Date.now() + RESET_LINK_TTL_MS });
  return { token, sentTo: maskEmail(account.user.recoveryEmail ?? normalizedEmail) };
};

// ¿El enlace sirve todavía? Devuelve el email de la cuenta o null.
const emailForToken = (token) => {
  const entry = resetTokens.get(token);
  if (!entry || entry.expiresAt < Date.now()) return null;
  return entry.email;
};

export const isPasswordResetTokenValid = (token) => emailForToken(token) !== null;

// Fija la contraseña elegida por la persona a través del enlace. El enlace sirve una sola vez.
export const completePasswordReset = async (token, newPassword) => {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS / 4));
  const accountEmail = emailForToken(token);
  if (!accountEmail) throw new Error('El enlace no es válido o venció');
  passwordOverrides.set(accountEmail, { password: newPassword, mustChangePassword: false });
  resetTokens.delete(token);
};

// Guarda la contraseña nueva elegida por la persona y saca la marca de cambio obligatorio.
export const changePassword = async (email, newPassword) => {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS / 4));
  const normalizedEmail = normalizeEmail(email);
  if (!passwordOverrides.get(normalizedEmail)?.mustChangePassword) {
    throw new Error('La cuenta no tiene un cambio de contraseña pendiente');
  }
  passwordOverrides.set(normalizedEmail, { password: newPassword, mustChangePassword: false });
};

const SIMULATED_LATENCY_MS = 2000;

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Credenciales incorrectas');
    this.name = 'InvalidCredentialsError';
  }
}

// Error para cuentas dadas de baja. Su `message` es el texto que ve el usuario.
export class AccountDeactivatedError extends Error {
  constructor() {
    super('Tu cuenta fue dada de baja. Contactá a la administración de tu clínica u hospital, o a VitaDev.');
    this.name = 'AccountDeactivatedError';
  }
}

// Error para cuentas inhabilitadas (temporal): se pueden volver a habilitar.
export class AccountDisabledError extends Error {
  constructor() {
    super('Tu cuenta está inhabilitada. Contactá a VitaDev para volver a habilitarla.');
    this.name = 'AccountDisabledError';
  }
}

export const login = async (email, password) => {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
  const normalizedEmail = normalizeEmail(email);
  const account = findAccount(normalizedEmail);
  const override = passwordOverrides.get(normalizedEmail);
  const currentPassword = override ? override.password : account?.password;
  if (!account || currentPassword !== password) throw new InvalidCredentialsError();
  // Credenciales correctas, pero la clínica le dio de baja: no puede entrar.
  if (deactivatedEmails.has(account.email)) throw new AccountDeactivatedError();
  if (disabledEmails.has(account.email)) throw new AccountDisabledError();
  const user = { ...account.user, email: account.email };
  // Contraseña temporal: el login avisa que hay que cambiarla antes de dejarlo entrar.
  return override?.mustChangePassword ? { ...user, mustChangePassword: true } : user;
};
