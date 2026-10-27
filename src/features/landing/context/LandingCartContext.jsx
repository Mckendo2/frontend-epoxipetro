import { createContext, useContext, useState, useEffect } from 'react';

const LandingCartContext = createContext();

export function LandingCartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('alvarez_landing_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastNotification, setLastNotification] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('alvarez_landing_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('No se pudo guardar el carrito:', e);
    }
  }, [cart]);

  const notify = (msg) => {
    setLastNotification(msg);
    setTimeout(() => {
      setLastNotification((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const addToCart = (product, presentation) => {
    const itemId = presentation.id;
    // El cliente solo ve y acumula según lo disponible en almacén
    const maxStock = Number(presentation.stock_almacen ?? presentation.stock_total ?? 0);

    setCart((prev) => {
      const existing = prev.find((i) => i.id === itemId);
      if (existing) {
        if (maxStock > 0 && existing.cantidad >= maxStock) {
          notify(`Stock máximo alcanzado (${maxStock} disponibles).`);
          return prev;
        }
        notify(`+1 ${product.nombre} sumado a la cotización.`);
        return prev.map((i) => (i.id === itemId ? { ...i, cantidad: i.cantidad + 1 } : i));
      }

      notify(`"${product.nombre}" agregado a tu cotización.`);
      return [
        ...prev,
        {
          id: itemId,
          producto_id: product.id,
          producto_nombre: product.nombre,
          presentacion_nombre: presentation.nombre,
          marca: product.marca,
          categoria: product.categoria,
          imagen_url: product.imagen_url,
          precio_venta: presentation.precio_venta || 0,
          unidad: presentation.unidad || 'pza',
          stock_disponible: maxStock,
          cantidad: 1,
        },
      ];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.cantidad + delta;
            if (nextQty <= 0) return null;
            if (item.stock_disponible > 0 && nextQty > item.stock_disponible) {
              notify(`Límite de stock alcanzado (${item.stock_disponible} unidades disponibles).`);
              return item;
            }
            return { ...item, cantidad: nextQty };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
    notify('Producto quitado de la cotización.');
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((acc, curr) => acc + curr.cantidad, 0);
  const totalAmount = cart.reduce((acc, curr) => acc + curr.cantidad * curr.precio_venta, 0);

  return (
    <LandingCartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        totalAmount,
        lastNotification,
      }}
    >
      {children}
    </LandingCartContext.Provider>
  );
}

export function useLandingCart() {
  const ctx = useContext(LandingCartContext);
  if (!ctx) {
    throw new Error('useLandingCart must be used within a LandingCartProvider');
  }
  return ctx;
}
