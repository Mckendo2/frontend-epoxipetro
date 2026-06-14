import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, IconButton, Badge,
  Drawer, TextField, CircularProgress, Snackbar, Alert, Divider
} from '@mui/material';
import { ShoppingCart, Plus, Minus, X, Package, MessageCircle } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/public';
const WHATSAPP_NUMBER = '59167341831'; // Número proporcionado por el usuario

const formatMonto = (monto) => Number(parseFloat(monto || 0).toFixed(2)).toLocaleString('de-DE');

const CatalogoPublicoPage = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carrito, setCarrito] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [clienteInfo, setClienteInfo] = useState({ nombre: '', celular: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    fetch(`${API}/catalogo`)
      .then(res => res.json())
      .then(data => {
        // Aplanar las presentaciones para listarlas individualmente si es necesario,
        // o mostrar el producto con sus presentaciones.
        // Haremos una lista plana para facilitar la compra.
        const flatList = data.flatMap(p => 
          p.presentaciones.map(pr => ({
            ...pr,
            producto_nombre: p.nombre,
            producto_id: p.id,
            imagen_url: p.imagen_url,
            categoria: p.categoria
          }))
        ).filter(pr => pr.stock_tienda > 0); // Solo mostramos lo que hay en stock en tienda
        
        setProductos(flatList);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const agregarAlCarrito = (item) => {
    setCarrito(prev => {
      const existe = prev.find(i => i.id === item.id);
      if (existe) {
        if (existe.cantidad >= item.stock_tienda) {
          setSnackbar({ open: true, message: 'No hay más stock disponible' });
          return prev;
        }
        return prev.map(i => i.id === item.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      }
      return [...prev, { ...item, cantidad: 1 }];
    });
  };

  const actualizarCantidad = (id, delta) => {
    setCarrito(prev => prev.map(item => {
      if (item.id === id) {
        const nuevaCant = item.cantidad + delta;
        if (nuevaCant < 1) return item;
        if (nuevaCant > item.stock_tienda) {
          setSnackbar({ open: true, message: 'Stock máximo alcanzado' });
          return item;
        }
        return { ...item, cantidad: nuevaCant };
      }
      return item;
    }));
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(prev => prev.filter(item => item.id !== id));
  };

  const enviarPedidoWhatsApp = () => {
    if (!clienteInfo.nombre) {
      setSnackbar({ open: true, message: 'Por favor, ingresa tu nombre' });
      return;
    }

    let texto = `*NUEVO PEDIDO - CATÁLOGO VIRTUAL*%0A`;
    texto += `*Cliente:* ${clienteInfo.nombre}%0A`;
    if (clienteInfo.celular) texto += `*Celular:* ${clienteInfo.celular}%0A`;
    texto += `%0A*Productos:*%0A`;

    let total = 0;
    carrito.forEach(item => {
      const subtotal = item.cantidad * item.precio_venta;
      total += subtotal;
      texto += `- ${item.cantidad}x ${item.producto_nombre} (${item.nombre}) - Bs. ${formatMonto(subtotal)}%0A`;
    });

    texto += `%0A*TOTAL: Bs. ${formatMonto(total)}*`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${texto}`;
    window.open(url, '_blank');
    setDrawerOpen(false);
    setCarrito([]);
  };

  const totalCarrito = carrito.reduce((acc, item) => acc + (item.cantidad * item.precio_venta), 0);
  const itemsTotales = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ pb: 10, bgcolor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 3, textAlign: 'center', boxShadow: 2, position: 'sticky', top: 0, zIndex: 10 }}>
        <Typography variant="h5" fontWeight={800}>Ferretería Alvarez</Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>Catálogo de Productos Disponibles</Typography>
      </Box>

      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, margin: '0 auto' }}>
        <Grid container spacing={3}>
          {productos.map(producto => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={producto.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <Box sx={{ height: 200, bgcolor: producto.imagen_url ? 'white' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {producto.imagen_url ? (
                    <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${producto.imagen_url}`} alt={producto.producto_nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Package size={48} color="#9ca3af" />
                  )}
                </Box>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                    {producto.categoria || 'Sin categoría'}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2, my: 1 }}>
                    {producto.producto_nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Presentación: {producto.nombre}
                  </Typography>
                  <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary.main" fontWeight={800}>
                      Bs. {formatMonto(producto.precio_venta)}
                    </Typography>
                    <Button 
                      variant="contained" 
                      size="small" 
                      onClick={() => agregarAlCarrito(producto)}
                      sx={{ borderRadius: 8, minWidth: 'auto', p: 1 }}
                    >
                      <Plus size={18} />
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {productos.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Package size={64} color="#d1d5db" style={{ margin: '0 auto' }} />
            <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>No hay productos disponibles por el momento</Typography>
          </Box>
        )}
      </Box>

      {/* Floating Cart Button */}
      {carrito.length > 0 && (
        <Box 
          sx={{ position: 'fixed', bottom: 20, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 100 }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => setDrawerOpen(true)}
            sx={{ borderRadius: 8, py: 1.5, px: 4, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)', display: 'flex', gap: 2, alignItems: 'center' }}
          >
            <Badge badgeContent={itemsTotales} color="error">
              <ShoppingCart size={24} />
            </Badge>
            <Typography fontWeight={700}>Ver pedido (Bs. {formatMonto(totalCarrito)})</Typography>
          </Button>
        </Box>
      )}

      {/* Cart Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: { xs: '100vw', sm: 400 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider', bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h6" fontWeight={700}>Tu Pedido</Typography>
            <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'white' }}><X size={24} /></IconButton>
          </Box>
          
          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
            {carrito.length === 0 ? (
              <Typography textAlign="center" color="text.secondary" sx={{ mt: 4 }}>Tu carrito está vacío</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {carrito.map(item => (
                  <Box key={item.id} sx={{ display: 'flex', gap: 2, alignItems: 'center', pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Box sx={{ width: 60, height: 60, borderRadius: 2, overflow: 'hidden', bgcolor: '#f3f4f6', flexShrink: 0 }}>
                      {item.imagen_url ? <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${item.imagen_url}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={30} color="#9ca3af" style={{ margin: '15px' }} />}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight={700}>{item.producto_nombre}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.nombre} | Bs. {formatMonto(item.precio_venta)}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                        <IconButton size="small" onClick={() => actualizarCantidad(item.id, -1)} sx={{ border: 1, borderColor: 'divider', p: 0.5 }}><Minus size={14} /></IconButton>
                        <Typography variant="body2" fontWeight={600} sx={{ minWidth: 20, textAlign: 'center' }}>{item.cantidad}</Typography>
                        <IconButton size="small" onClick={() => actualizarCantidad(item.id, 1)} sx={{ border: 1, borderColor: 'divider', p: 0.5 }}><Plus size={14} /></IconButton>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight={700}>Bs. {formatMonto(item.cantidad * item.precio_venta)}</Typography>
                      <Button size="small" color="error" onClick={() => eliminarDelCarrito(item.id)} sx={{ minWidth: 'auto', p: 0, textTransform: 'none', mt: 1 }}>Quitar</Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {carrito.length > 0 && (
            <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Total:</Typography>
                <Typography variant="h6" fontWeight={800} color="primary.main">Bs. {formatMonto(totalCarrito)}</Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Tus Datos para el Pedido</Typography>
              <TextField 
                size="small" 
                fullWidth 
                placeholder="Nombre Completo" 
                sx={{ mb: 2 }}
                value={clienteInfo.nombre}
                onChange={e => setClienteInfo({...clienteInfo, nombre: e.target.value})}
              />
              <TextField 
                size="small" 
                fullWidth 
                placeholder="Celular (Opcional)" 
                sx={{ mb: 3 }}
                value={clienteInfo.celular}
                onChange={e => setClienteInfo({...clienteInfo, celular: e.target.value})}
              />
              
              <Button 
                variant="contained" 
                fullWidth 
                onClick={enviarPedidoWhatsApp}
                sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#128C7E' }, color: 'white', py: 1.5, borderRadius: 2, display: 'flex', gap: 1 }}
              >
                <MessageCircle size={20} />
                <Typography fontWeight={700}>Hacer pedido por WhatsApp</Typography>
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="warning" sx={{ width: '100%', boxShadow: 3 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default CatalogoPublicoPage;
