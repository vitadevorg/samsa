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
];

const SIMULATED_LATENCY_MS = 2000;

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Credenciales incorrectas');
    this.name = 'InvalidCredentialsError';
  }
}

export const login = async (email, password) => {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
  const normalizedEmail = email.trim().toLowerCase();
  const account = DEMO_ACCOUNTS.find(
    (acc) => acc.email === normalizedEmail && acc.password === password
  );
  if (!account) throw new InvalidCredentialsError();
  return { ...account.user, email: account.email };
};
