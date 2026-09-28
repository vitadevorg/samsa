import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AuthContext } from './auth-context';
import { ROLES } from '../constants/roles';

const STORAGE_KEY = 'samsa_user';
const VALID_ROLES = Object.values(ROLES);

const readStoredUser = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);

  useEffect(() => {
    try {
      if (user) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage lleno o bloqueado (p. ej. una foto de perfil en base64): la sesión sigue en memoria.
    }
  }, [user]);

  const login = useCallback((userData) => {
    if (!VALID_ROLES.includes(userData?.role)) {
      throw new Error(`Rol de usuario inválido: ${userData?.role}`);
    }
    setUser(userData);
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const updateUser = useCallback((newUserData) => {
    setUser((prev) => (prev ? { ...prev, ...newUserData } : prev));
  }, []);

  const value = useMemo(
    () => ({ user, login, logout, updateUser }),
    [user, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
