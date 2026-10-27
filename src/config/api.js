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
 * Resuelve la URL de la imagen del producto.
 * Si es null o no existe, retorna una imagen temática de alta resolución de la categoría.
 */
export const getCategoryFallbackImage = (categoria = '') => {
  const cat = (categoria || '').toLowerCase();
  if (cat.includes('chapa') || cat.includes('cerradura')) return '/landing/chapas.png';
  if (cat.includes('candado')) return '/landing/candados.png';
  if (cat.includes('resina')) return '/landing/resinas.png';
  if (cat.includes('electr')) return '/landing/electricos.png';
  if (cat.includes('broca') || cat.includes('herramienta') || cat.includes('disco')) return '/landing/insumos.png';
  return '/landing/insumos.png';
};

export const getProductImageUrl = (imagen_url, categoria) => {
  if (!imagen_url) {
    return getCategoryFallbackImage(categoria);
  }
  if (imagen_url.startsWith('http://') || imagen_url.startsWith('https://')) {
    return imagen_url;
  }
  const base = getApiBaseUrl();
  const cleanPath = imagen_url.startsWith('/') ? imagen_url : `/${imagen_url}`;
  return `${base}${cleanPath}`;
};
