/**
 * Configuración dinámica de la URL del Backend.
 *
 * Funciona de forma transparente tanto en desarrollo local como en producción:
 * 1. Prioridad: VITE_API_URL configurado en variables de entorno de Vercel/Hosting.
 * 2. Detección automática de dominio: Si corre en epoxipetro.com, apunta a https://api.epoxipetro.com
 * 3. Desarrollo local: Fallback a http://localhost:3000
 */
export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    if (hostname.includes('epoxipetro.com')) {
      return 'https://api.epoxipetro.com';
    }
  }

  return 'http://localhost:3000';
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Resuelve la URL de la imagen del producto cargada en el servidor.
 * Si no tiene imagen, retorna null para mostrar el placeholder limpio de icono.
 */
export const getProductImageUrl = (imagen_url) => {
  if (!imagen_url || typeof imagen_url !== 'string' || imagen_url.trim() === '') {
    return null;
  }
  if (imagen_url.startsWith('http://') || imagen_url.startsWith('https://')) {
    return imagen_url;
  }
  const base = getApiBaseUrl();
  const cleanPath = imagen_url.startsWith('/') ? imagen_url : `/${imagen_url}`;
  return `${base}${cleanPath}`;
};
