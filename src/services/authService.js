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
    user: { name: 'Jesús Zelarayan', role: ROLES.DOCTOR, img: '/img/UTN-Jesus.jpg' },
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
    user: { name: 'VitaDev', role: ROLES.VITADEV_ADMIN },
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
];

// Emails de cuentas dadas de baja por su institución. Es un Set (un conjunto:
// no guarda repetidos) que vive en memoria mientras la página esté abierta;
// al recargar se vacía. Con backend, esto sería un dato de la base.
const deactivatedEmails = new Set();

// Marca una cuenta como dada de baja: ya no va a poder iniciar sesión.
export const deactivateAccount = (email) => {
  deactivatedEmails.add(email.trim().toLowerCase());
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
    super('Tu cuenta fue dada de baja. Contactá a la administración de tu clínica.');
    this.name = 'AccountDeactivatedError';
  }
}

export const login = async (email, password) => {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
  const normalizedEmail = email.trim().toLowerCase();
  const account = DEMO_ACCOUNTS.find(
    (acc) => acc.email === normalizedEmail && acc.password === password
  );
  if (!account) throw new InvalidCredentialsError();
  // Credenciales correctas, pero la clínica le dio de baja: no puede entrar.
  if (deactivatedEmails.has(account.email)) throw new AccountDeactivatedError();
  return { ...account.user, email: account.email };
};
