import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Temporizador de inactividad (15 minutos = 15 * 60 * 1000 = 900000 ms)
  const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; 

  const API_AUTH = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/auth';

  useEffect(() => {
    // Si hay token, verificamos primero si la inactividad expiró
    if (token) {
      const lastActivity = localStorage.getItem('lastActivity');
      if (lastActivity && Date.now() - parseInt(lastActivity, 10) > INACTIVITY_LIMIT_MS) {
        logout();
        setLoading(false);
        return; // Salimos porque ya expiró
      }

      // Cargamos el usuario desde localStorage como valor inicial rápido
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
      }

      // Luego refrescamos permisos desde el servidor (por si admin cambió roles/permisos)
      fetch(`${API_AUTH}/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (res.status === 401 || res.status === 403 || res.status === 404) {
            logout(); // Token inválido o usuario desactivado
            return null;
          }
          return res.json();
        })
        .then(userData => {
          if (userData) {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          }
        })
        .catch(() => {
          // Si falla la red, seguimos con los datos locales (modo offline)
        })
        .finally(() => setLoading(false));

      return; // setLoading se hace en el fetch
    }
    setLoading(false);
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('lastActivity', Date.now().toString());
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (!token) return;

    const updateActivity = () => {
      localStorage.setItem('lastActivity', Date.now().toString());
    };

    // Al cargar la app con token activo, refrescamos la actividad
    updateActivity();

    // Usamos un throttle para no escribir en localStorage por cada pixel que se mueva el mouse
    let throttleTimer = null;
    const handleActivity = () => {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        updateActivity();
        throttleTimer = null;
      }, 1000); // 1 segundo de intervalo para optimizar rendimiento
    };

    // Validar expiración cada 10 segundos
    const checkInterval = setInterval(() => {
      const lastAct = localStorage.getItem('lastActivity');
      if (lastAct && Date.now() - parseInt(lastAct, 10) > INACTIVITY_LIMIT_MS) {
        logout();
      }
    }, 10000);

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      if (throttleTimer) clearTimeout(throttleTimer);
      clearInterval(checkInterval);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
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
