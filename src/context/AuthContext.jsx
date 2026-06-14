import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si hay token, intentamos recuperar el usuario del localStorage
    if (token) {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
      }
    }
    setLoading(false);
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const hasPermission = (codigo) => {
    // Si no hay usuario, falso
    if (!user) return false;
    // El Administrador siempre tiene acceso total por defecto
    if (user.rol_nombre === 'Administrador') return true;
    
    // Si no tiene arreglo de permisos, falso
    if (!user.permisos) return false;
    
    // Si tiene el permiso exacto
    return user.permisos.includes(codigo);
  };

  if (loading) return null; // o un spinner global

  return (
    <AuthContext.Provider value={{ user, token, login, logout, hasPermission, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};
