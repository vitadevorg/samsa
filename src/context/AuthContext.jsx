import React, { createContext, useState, useContext } from 'react';
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const login = (userData) => {
    let finalRole = userData.role;
    if (!finalRole) {
        finalRole = userData.email.includes('medico') ? 'doctor' : 'patient';
    }
    setUser({ ...userData, role: finalRole });
  };
  const logout = () => {
    setUser(null);
  };
  const updateUser = (newUserData) => {
      setUser((prev) => ({ ...prev, ...newUserData }));
  };
  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);