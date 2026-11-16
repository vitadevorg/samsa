import { createContext } from 'react';
import { ROLES } from '../constants/roles';

export const ForumContext = createContext(null);

// Solo el administrador de VitaDev puede borrar publicaciones de otros autores (moderación).
export const canModerate = (user) => user?.role === ROLES.VITADEV_ADMIN;
