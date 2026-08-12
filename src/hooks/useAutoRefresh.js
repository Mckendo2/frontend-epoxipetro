import { useEffect, useRef } from 'react';

/**
 * Hook que refresca datos automáticamente cuando:
 * 1. El usuario vuelve a la pestaña del navegador (visibilitychange)
 * 2. Cada `intervalMs` milisegundos (por defecto 60 segundos)
 *
 * Uso: useAutoRefresh(fetchData, 60000);
 */
const useAutoRefresh = (fetchFn, intervalMs = 60000) => {
  const fetchRef = useRef(fetchFn);

  // Mantener referencia actualizada sin re-registrar eventos
  useEffect(() => {
    fetchRef.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    // Refrescar al volver a la pestaña
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchRef.current();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Refrescar periódicamente mientras la pestaña está activa
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchRef.current();
      }
    }, intervalMs);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(interval);
    };
  }, [intervalMs]);
};

export default useAutoRefresh;
