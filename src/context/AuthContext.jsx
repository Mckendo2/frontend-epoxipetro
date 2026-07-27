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

  // Temporizador de inactividad (15 minutos = 15 * 60 * 1000 = 900000 ms)
  const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; 

  useEffect(() => {
    let inactivityTimer;

    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (token) {
        inactivityTimer = setTimeout(() => {
          logout();
          // Opcionalmente podemos disparar un evento o alerta, pero el estado cambia a null y forzará el login
        }, INACTIVITY_LIMIT_MS);
      }
    };

    // Solo activamos los listeners si hay un usuario logueado
    if (token) {
      resetTimer();
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keydown', resetTimer);
      window.addEventListener('click', resetTimer);
      window.addEventListener('scroll', resetTimer);
    }

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, [token]);

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
