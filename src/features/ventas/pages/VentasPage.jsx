import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Card, Typography, Chip, IconButton, Button, TextField, InputAdornment,
  Select, MenuItem, FormControl, Divider, Snackbar, Alert, LinearProgress,
  Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, useTheme
} from '@mui/material';
import {
  Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote,
  Smartphone, Receipt, User, Package, AlertTriangle, CheckCircle, X,
  Calendar, Tag, LayoutGrid, UserPlus, Printer
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import TicketVenta from '../components/TicketVenta';
import { useAuth } from '../../../context/AuthContext';

const API_INV = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/inventario';
const API_VEN = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/ventas';
const API_GAS = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/gastos';

const METODOS_PAGO = [
  { value: 'efectivo',      label: 'Efectivo',      icon: <Banknote size={24} /> },
  { value: 'tarjeta',       label: 'Tarjeta',        icon: <CreditCard size={24} /> },
  { value: 'transferencia', label: 'Transferencia',  icon: <Smartphone size={24} /> },
  { value: 'qr',            label: 'Yape / QR',      icon: <Smartphone size={24} /> },
];

const formatMonto = (monto) => Number(parseFloat(monto || 0).toFixed(2)).toLocaleString('de-DE');

const getLocalDateString = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const VentasPage = () => {
  const { user } = useAuth();
  const [stock, setStock] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colorDarkBtn = isDark ? theme.palette.primary.main : '#1e293b';
  const colorDarkBtnHover = isDark ? theme.palette.primary.dark : '#0f172a';
  const colorText = isDark ? theme.palette.text.primary : '#1e293b';
  const colorDisabledBg = isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0';
  const colorDisabledText = isDark ? 'rgba(255, 255, 255, 0.3)' : '#94a3b8';

  // Carrito
  const [carrito, setCarrito] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [descuento, setDescuento] = useState('');
  const [nota, setNota] = useState('');

  // Estados para Modal Ticket
  const [modalTicket, setModalTicket] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const ticketRef = React.useRef();

  const handlePrintTicket = useReactToPrint({
    contentRef: ticketRef,
    documentTitle: 'Ticket_Venta'
  });
  const [procesando, setProcesando] = useState(false);
  const [tipoVenta, setTipoVenta] = useState('contado');

  const [modalCliente, setModalCliente] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', apellido: '', telefono: '', correo: '', direccion: '' });
  const [procesandoCliente, setProcesandoCliente] = useState(false);

  // Modo Checkout (Datos del pago)
  const [checkoutMode, setCheckoutMode] = useState(false);

  // Modal Cambio
  const [modalCambio, setModalCambio] = useState(false);
  const [montoPagado, setMontoPagado] = useState('');

  // Modal Gasto
  const [modalGasto, setModalGasto] = useState(false);
  const [gastoData, setGastoData] = useState({
    fecha: getLocalDateString(new Date()),
    categoria: '',
    valor: '',
    nombre: '',
    metodoPago: 'efectivo',
  });
  const [procesandoGasto, setProcesandoGasto] = useState(false);

  const handleCrearGasto = async () => {
    if (!gastoData.categoria || !gastoData.valor || !gastoData.metodoPago) {
      return notify('Completa los campos obligatorios del gasto', 'warning');
    }
    setProcesandoGasto(true);
    try {
      const res = await fetch(API_GAS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha: gastoData.fecha,
          categoria: gastoData.categoria,
          valor: parseFloat(gastoData.valor),
          nombre: gastoData.nombre,
          metodoPago: gastoData.metodoPago
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        notify('Gasto creado exitosamente');
        setModalGasto(false);
        setGastoData({
          fecha: getLocalDateString(new Date()),
          categoria: '',
          valor: '',
          nombre: '',
          metodoPago: 'efectivo',
        });
      } else {
        notify(data.mensaje || 'Error al crear el gasto', 'error');
      }
    } catch {
      notify('Error de conexión al crear el gasto', 'error');
    } finally {
      setProcesandoGasto(false);
    }
  };

  const handleCrearCliente = async () => {
    if (!nuevoCliente.nombre || !nuevoCliente.apellido || !nuevoCliente.telefono) {
      return notify('Nombre, apellido y teléfono son obligatorios', 'warning');
    }
    setProcesandoCliente(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoCliente)
      });
      const data = await res.json();
      if (res.ok) {
        notify('Cliente creado exitosamente');
        setModalCliente(false);
        setNuevoCliente({ nombre: '', apellido: '', telefono: '', correo: '', direccion: '' });
        
        const resClientes = await fetch(`${API_VEN}/clientes`);
        const clientesActualizados = await resClientes.json();
        setClientes(clientesActualizados);
        setClienteId(data.id);
      } else {
        notify(data.mensaje || 'Error al crear cliente', 'error');
      }
    } catch {
      notify('Error de conexión', 'error');
    } finally {
      setProcesandoCliente(false);
    }
  };

  const notify = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [stockRes, clientesRes] = await Promise.all([
        fetch(`${API_INV}/productos`),
        fetch(`${API_VEN}/clientes`)
      ]);
      const productosData = await stockRes.json();
      // Lista plana de presentaciones con stock en tienda > 0
      const presentaciones = productosData.flatMap(p =>
        p.presentaciones
          .filter(pr => pr.stock_tienda > 0)
          .map(pr => ({ ...pr, producto: p.nombre, categoria: p.categoria, marca: p.marca, imagen_url: p.imagen_url }))
      ).sort((a, b) => a.producto.localeCompare(b.producto));
      setStock(presentaciones);
      setClientes(await clientesRes.json());
    } catch {
      notify('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stockFiltrado = stock.filter(pr =>
    pr.producto.toLowerCase().includes(busqueda.toLowerCase()) ||
    pr.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    pr.categoria?.toLowerCase().includes(busqueda.toLowerCase()) ||
    pr.codigo_barras?.includes(busqueda)
  );

  // ---- Carrito ----
  const agregarAlCarrito = (pr) => {
    setCarrito(prev => {
      const existente = prev.find(i => i.id === pr.id);
      if (existente) {
        if (existente.cantidad >= pr.stock_tienda) {
          notify(`Stock máximo: ${pr.stock_tienda} ${pr.unidad}`, 'warning');
          return prev;
        }
        return prev.map(i => i.id === pr.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      }
      return [...prev, { ...pr, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (id, nuevaCantidad) => {
    const item = stock.find(s => s.id === id);
    if (nuevaCantidad < 1) { quitarDelCarrito(id); return; }
    if (item && nuevaCantidad > item.stock_tienda) {
      notify(`Stock máximo: ${item.stock_tienda} ${item.unidad}`, 'warning');
      return;
    }
    setCarrito(prev => prev.map(i => i.id === id ? { ...i, cantidad: nuevaCantidad } : i));
  };

  const cambiarPrecio = (id, nuevoPrecio) => {
    setCarrito(prev => prev.map(i => i.id === id ? { ...i, precio_venta: Math.max(0, nuevoPrecio) } : i));
  };

  const quitarDelCarrito = (id) => setCarrito(prev => prev.filter(i => i.id !== id));

  const limpiarCarrito = () => {
    setCarrito([]);
    setNota('');
    setMetodoPago('efectivo');
    setTipoVenta('contado');
    setDescuento('');
  };

  const subtotal = carrito.reduce((acc, i) => acc + parseFloat(i.precio_venta) * i.cantidad, 0);
  const descuentoNum = parseFloat(descuento) || 0;
  const total = subtotal - descuentoNum;

  const iniciarVenta = () => {
    if (carrito.length === 0) return notify('Agrega al menos un producto', 'warning');
    if (total < 0) return notify('El descuento no puede superar el subtotal', 'warning');
    if (tipoVenta === 'credito' && !clienteId) return notify('Para ventas a crédito debes seleccionar un cliente', 'warning');
    setMontoPagado('');
    if (tipoVenta === 'credito') {
      handleConfirmar(); // Saltar cálculo de cambio si es a crédito
    } else {
      setModalCambio(true);
    }
  };

  const handleConfirmar = async () => {
    if (carrito.length === 0) return notify('Agrega al menos un producto', 'warning');
    if (total < 0) return notify('El descuento no puede superar el subtotal', 'warning');

    setProcesando(true);
    try {
      const res = await fetch(`${API_VEN}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: clienteId || null,
          usuario_id: user?.id || null,
          tipo_venta: tipoVenta,
          metodo_pago: tipoVenta === 'credito' ? 'efectivo' : metodoPago,
          descuento: parseFloat(descuento) || 0,
          nota: nota || null,
          items: carrito.map(item => ({
            presentacion_id: item.id,
            cantidad: item.cantidad,
            precio_unitario: item.precio_venta
          }))
        })
      });
      const data = await res.json();
      if (res.ok) {
        notify(`✓ Venta #${data.id} registrada — Total: Bs. ${formatMonto(data.total)}`);
        
        // Cargar datos para el ticket ANTES de limpiar el carrito
        const pagoConfirmado = parseFloat(montoPagado) || total;
        const cambioConfirmado = pagoConfirmado - total;

        setTicketData({
          ventaInfo: { nro_ticket: data.id, fecha: new Date() },
          cliente: clientes.find(c => c.id === clienteId) || null,
          items: [...carrito],
          total: total,
          descuento: parseFloat(descuento) || 0,
          pagado: pagoConfirmado,
          cambio: cambioConfirmado > 0 ? cambioConfirmado : 0
        });

        setModalCambio(false);
        setCheckoutMode(false);
        limpiarCarrito();
        fetchData(); // Actualizar stock

        // Mostrar el modal del ticket
        setModalTicket(true);
      } else {
        notify(data.mensaje, 'error');
      }
    } catch {
      notify('Error de conexión', 'error');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 140px)', minHeight: 600 }}>

      {/* ===== PANEL IZQUIERDO: Productos ===== */}
      <Box sx={{ flex: '1 1 60%', display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" fontWeight={700} color="text.primary">Punto de Venta</Typography>
            <Typography variant="body2" color="text.secondary">
              {stock.length} presentación(es) disponibles en tienda
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Plus size={18} />}
              onClick={() => setModalGasto(true)}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: 'divider', color: colorText }}
            >
              Nuevo gasto
            </Button>
            {loading && <LinearProgress sx={{ width: 100, borderRadius: 1 }} />}
          </Box>
        </Box>

        {/* Buscador */}
        <TextField
          placeholder="Buscar producto, código de barras..."
          size="small"
          fullWidth
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={18} color="#9ca3af" /></InputAdornment> } }}
        />

        {/* Lista de productos */}
        <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5 }}>
          {stockFiltrado.length === 0 && !loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 1 }}>
              <Package size={48} color="#9ca3af" />
              <Typography color="text.secondary">No hay productos disponibles en tienda</Typography>
              <Typography variant="caption" color="text.disabled">Traslada productos desde el Almacén a la Tienda</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 2, p: 1 }}>
              {stockFiltrado.map(pr => {
                const enCarrito = carrito.find(i => i.id === pr.id);
                const stockBajo = pr.stock_tienda <= pr.stock_minimo && pr.stock_minimo > 0;
                return (
                  <Card
                    key={pr.id}
                    onClick={() => agregarAlCarrito(pr)}
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      p: 1.5,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: enCarrito ? 'primary.main' : 'divider',
                      backgroundColor: enCarrito ? 'rgba(99,102,241,0.05)' : 'background.paper',
                      transition: 'all 0.15s',
                      borderRadius: 3,
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'rgba(99,102,241,0.08)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(99,102,241,0.15)'
                      }
                    }}
                  >
                    {/* Badge Carrito */}
                    {enCarrito && (
                      <Box sx={{ 
                        position: 'absolute', top: -6, right: -6, bgcolor: '#1e293b', color: 'white', 
                        borderRadius: 2, width: 24, height: 24, display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', zIndex: 1,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}>
                        {enCarrito.cantidad}
                      </Box>
                    )}
                    
                    {/* Image */}
                    <Box sx={{ 
                      width: 80, height: 80, mb: 1.5, borderRadius: 2, overflow: 'hidden', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      bgcolor: pr.imagen_url ? 'transparent' : 'rgba(99,102,241,0.08)' 
                    }}>
                      {pr.imagen_url ? (
                        <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${pr.imagen_url}`} alt={pr.producto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Package size={32} color="#6366f1" opacity={0.6} />
                      )}
                    </Box>

                    {/* Details */}
                    <Typography variant="body1" fontWeight={800} color="text.primary">Bs {formatMonto(pr.precio_venta)}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ 
                      textAlign: 'center', mt: 0.5, lineHeight: 1.2, height: 30, 
                      overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' 
                    }}>
                      {pr.producto} {pr.nombre && pr.nombre !== 'Unidad' ? `- ${pr.nombre}` : ''}
                    </Typography>

                    {/* Pill */}
                    <Box sx={{ mt: 'auto', pt: 1.5 }}>
                      <Chip 
                        label={`${pr.stock_tienda} disponibles`} 
                        size="small" 
                        sx={{ 
                          height: 22, fontSize: '0.65rem', 
                          backgroundColor: stockBajo ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.15)', 
                          color: stockBajo ? '#ef4444' : '#059669', 
                          fontWeight: 700 
                        }} 
                      />
                    </Box>
                  </Card>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>

      {/* ===== PANEL DERECHO: Carrito ===== */}
      <Box sx={{ flex: '0 0 400px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Card sx={{
          flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
          border: '1px solid', borderColor: 'divider'
        }}>
          {!checkoutMode ? (
            <>
              {/* Header carrito */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShoppingCart size={20} color={colorText} />
                  <Typography fontWeight={700} color="text.primary">Productos</Typography>
                </Box>
                {carrito.length > 0 && (
                  <Button size="small" onClick={limpiarCarrito} sx={{ textTransform: 'none', color: '#0ea5e9', fontWeight: 600, '&:hover': { textDecoration: 'underline', backgroundColor: 'transparent' } }}>
                    Vaciar canasta
                  </Button>
                )}
              </Box>

              {/* Items del carrito */}
              <Box sx={{ flex: 1, overflowY: 'auto', p: carrito.length ? 1 : 2 }}>
                {carrito.length === 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 1.5, opacity: 0.6 }}>
                    <ShoppingCart size={48} color="#9ca3af" />
                    <Typography color="text.secondary" variant="body2">El carrito está vacío</Typography>
                    <Typography variant="caption" color="text.disabled">Haz clic en un producto para añadirlo</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    {carrito.map(item => (
                      <Box key={item.id} sx={{ p: 2, mb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 40, height: 40, borderRadius: 2, backgroundColor: 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Package size={20} color="#6366f1" />
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.primary" display="block">
                                {item.producto}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>{item.nombre}</Typography>
                            </Box>
                          </Box>
                          <IconButton size="small" onClick={() => quitarDelCarrito(item.id)} sx={{ 
                            color: 'error.main', border: '1px solid', borderColor: 'error.main', borderRadius: 2, p: 0.75 
                          }}>
                            <Trash2 size={18} />
                          </IconButton>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            <IconButton size="small" onClick={() => cambiarCantidad(item.id, item.cantidad - 1)} sx={{ p: 1 }}>
                              <Minus size={18} />
                            </IconButton>
                            <TextField
                              value={item.cantidad}
                              onChange={e => cambiarCantidad(item.id, parseFloat(e.target.value) || 1)}
                              size="small" type="number"
                              inputProps={{ min: 1, max: item.stock_tienda, style: { textAlign: 'center', padding: '6px', fontWeight: 700 } }}
                              sx={{ flex: 1, '& fieldset': { border: 'none' } }}
                            />
                            <IconButton size="small" onClick={() => cambiarCantidad(item.id, item.cantidad + 1)} sx={{ p: 1 }}>
                              <Plus size={18} />
                            </IconButton>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, border: '1px solid', borderColor: 'divider', borderRadius: 2, px: 1.5 }}>
                            <Typography variant="body2" color="text.secondary" fontWeight={600}>Bs</Typography>
                            <TextField
                              value={item.precio_venta}
                              onChange={e => cambiarPrecio(item.id, e.target.value)}
                              size="small" type="number"
                              inputProps={{ min: 0, step: "0.1", style: { padding: '8px 4px' } }}
                              sx={{ flex: 1, '& fieldset': { border: 'none' } }}
                            />
                          </Box>
                        </Box>
                        <Typography variant="body2" fontWeight={600} color="text.secondary">
                          Precio por {item.cantidad} unidades: <Box component="span" sx={{ color: 'text.primary' }}>Bs {formatMonto(item.precio_venta * item.cantidad)}</Box>
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>

              {/* Footer Continuar */}
              <Box sx={{ p: 2, backgroundColor: 'background.paper' }}>
                <Button
                  fullWidth
                  onClick={() => setCheckoutMode(true)}
                  disabled={carrito.length === 0}
                  sx={{
                    backgroundColor: colorDarkBtn,
                    color: 'white',
                    p: 2,
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textTransform: 'none',
                    '&:hover': { backgroundColor: colorDarkBtnHover },
                    '&.Mui-disabled': { backgroundColor: colorDisabledBg, color: colorDisabledText }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 1.5, px: 1.5, py: 0.5, fontWeight: 700, fontSize: '1.1rem' }}>
                      {carrito.length}
                    </Box>
                    <Typography fontWeight={700} fontSize="1.1rem">Continuar</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography fontWeight={800} fontSize="1.1rem">Bs {formatMonto(subtotal)}</Typography>
                    <Typography fontWeight={800} fontSize="1.4rem" sx={{ lineHeight: 1, ml: 1 }}>›</Typography>
                  </Box>
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <IconButton size="small" onClick={() => setCheckoutMode(false)}><X size={20} color={colorText} /></IconButton>
                <Typography fontWeight={700} variant="h6" color={colorText}>Datos del pago</Typography>
              </Box>
              <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 4 }}>
                
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={2}>Los campos marcados con asterisco (*) son obligatorios</Typography>
                  <Box sx={{ display: 'flex', border: '1px solid', borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}>
                    <Button 
                      fullWidth 
                      onClick={() => setTipoVenta('contado')}
                      sx={{ borderRadius: 0, backgroundColor: tipoVenta === 'contado' ? '#10b981' : 'transparent', color: tipoVenta === 'contado' ? 'white' : 'text.secondary', fontWeight: 600, py: 1.25, '&:hover':{backgroundColor: tipoVenta === 'contado' ? '#059669' : 'action.hover'} }}
                    >
                      Pagada
                    </Button>
                    <Button 
                      fullWidth 
                      onClick={() => setTipoVenta('credito')}
                      sx={{ borderRadius: 0, backgroundColor: tipoVenta === 'credito' ? '#ef4444' : 'transparent', color: tipoVenta === 'credito' ? 'white' : 'text.secondary', fontWeight: 600, py: 1.25, '&:hover':{backgroundColor: tipoVenta === 'credito' ? '#dc2626' : 'action.hover'} }}
                    >
                      A crédito
                    </Button>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="body2" fontWeight={600} mb={1.5} color={colorText}>Fecha de la venta *</Typography>
                  <TextField size="medium" fullWidth value={new Date().toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' })} disabled 
                    sx={{ '& .MuiInputBase-root': { borderRadius: 1.5, backgroundColor: 'background.default' } }}
                  />
                </Box>

                {tipoVenta === 'contado' && (
                  <Box>
                    <Typography variant="body2" fontWeight={600} mb={1.5} color={colorText}>Selecciona el método de pago *</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                      {METODOS_PAGO.map(m => (
                        <Card key={m.value} onClick={() => setMetodoPago(m.value)} sx={{ 
                          p: 2, cursor: 'pointer', textAlign: 'center', border: '2px solid', position: 'relative',
                          borderColor: metodoPago === m.value ? '#10b981' : 'divider',
                          backgroundColor: metodoPago === m.value ? 'rgba(16,185,129,0.02)' : 'background.paper',
                          boxShadow: 'none', borderRadius: 2, transition: 'all 0.2s'
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1, color: metodoPago === m.value ? '#10b981' : colorText }}>
                            {m.icon}
                          </Box>
                          <Typography variant="body2" fontWeight={600} color={metodoPago === m.value ? '#10b981' : 'text.secondary'}>
                            {m.label}
                          </Typography>
                          {metodoPago === m.value && (
                            <Box sx={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <CheckCircle size={14} color="white" />
                            </Box>
                          )}
                        </Card>
                      ))}
                    </Box>
                  </Box>
                )}

                <Box>
                  <Typography variant="body2" fontWeight={600} mb={1.5} color={colorText}>Descuento</Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <TextField 
                      size="medium" type="number" placeholder="Monto (Bs)" 
                      value={descuento} onChange={e => setDescuento(e.target.value)} 
                      inputProps={{min:0}} fullWidth 
                      sx={{ '& .MuiInputBase-root': { borderRadius: 1.5 } }}
                    />
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="body2" fontWeight={600} mb={1.5} color={colorText}>Cliente {tipoVenta === 'credito' && <span style={{color: '#ef4444'}}>*</span>}</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Select size="medium" fullWidth value={clienteId} onChange={e => setClienteId(e.target.value)} displayEmpty sx={{ borderRadius: 1.5 }}>
                      <MenuItem value=""><em>Cliente general (sin asignar)</em></MenuItem>
                      {clientes.map(c => <MenuItem key={c.id} value={c.id}>{c.nombre} {c.apellido}</MenuItem>)}
                    </Select>
                    <Tooltip title="Nuevo Cliente">
                      <Button variant="outlined" onClick={() => setModalCliente(true)} sx={{ minWidth: 50, borderRadius: 1.5, borderColor: 'divider', color: colorText }}>
                        <UserPlus size={20} />
                      </Button>
                    </Tooltip>
                  </Box>
                </Box>

              </Box>
              
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', backgroundColor: 'background.paper' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.5, px: 1 }}>
                   <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                     <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                     <Typography variant="body2">Bs. {formatMonto(subtotal)}</Typography>
                   </Box>
                   {descuentoNum > 0 && (
                     <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                       <Typography variant="body2" color="error.main">Descuento</Typography>
                       <Typography variant="body2" color="error.main">- Bs. {formatMonto(descuentoNum)}</Typography>
                     </Box>
                   )}
                </Box>
                <Button
                  fullWidth
                  onClick={iniciarVenta}
                  disabled={procesando}
                  sx={{
                    backgroundColor: colorDarkBtn,
                    color: 'white',
                    p: 2,
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textTransform: 'none',
                    '&:hover': { backgroundColor: colorDarkBtnHover },
                    '&.Mui-disabled': { backgroundColor: colorDisabledBg, color: colorDisabledText }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 1.5, px: 1.5, py: 0.5, fontWeight: 700, fontSize: '1.1rem' }}>
                      {carrito.length}
                    </Box>
                    <Typography fontWeight={700} fontSize="1.1rem">{procesando ? 'Procesando...' : 'Crear venta'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography fontWeight={800} fontSize="1.1rem">Bs {formatMonto(total)}</Typography>
                    <Typography fontWeight={800} fontSize="1.4rem" sx={{ lineHeight: 1, ml: 1 }}>›</Typography>
                  </Box>
                </Button>
              </Box>
            </Box>
          )}
        </Card>
      </Box>

      {/* Modal de Cambio */}
      <Dialog open={modalCambio} onClose={() => !procesando && setModalCambio(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" fontWeight={700} color={colorText}>Calcula el cambio de tu venta</Typography>
          <IconButton size="small" onClick={() => !procesando && setModalCambio(false)} sx={{ backgroundColor: 'action.hover' }}>
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '12px !important' }}>
          
          <Box>
            <Typography variant="body2" fontWeight={600} mb={1} color={colorText}>Valor de la venta</Typography>
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5, backgroundColor: 'rgba(0,0,0,0.02)' }}>
              <Typography variant="body1" color="text.secondary">Bs {formatMonto(total)}</Typography>
            </Box>
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={600} mb={1} color={colorText}>¿Con cuánto paga tu cliente?</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', border: `2px solid ${colorText}`, borderRadius: 2, px: 1.5 }}>
              <Typography variant="body1" color="text.secondary" fontWeight={600}>Bs</Typography>
              <TextField
                autoFocus
                value={montoPagado}
                onChange={e => setMontoPagado(e.target.value)}
                type="number"
                placeholder="0"
                inputProps={{ min: 0, step: "0.1", style: { padding: '12px 8px', fontSize: '1.1rem' } }}
                sx={{ flex: 1, '& fieldset': { border: 'none' } }}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
            <Typography variant="body2" fontWeight={700} color={colorText}>Valor a devolver</Typography>
            <Typography variant="body1" fontWeight={800} color={colorText}>
              Bs {formatMonto(Math.max(0, (parseFloat(montoPagado) || 0) - total))}
            </Typography>
          </Box>

        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            fullWidth
            onClick={handleConfirmar}
            variant="contained"
            disabled={procesando}
            sx={{ 
              backgroundColor: colorDarkBtn, 
              color: 'white', 
              py: 1.5, 
              borderRadius: 2, 
              textTransform: 'none', 
              fontWeight: 700, 
              fontSize: '1rem',
              '&:hover': { backgroundColor: colorDarkBtnHover } 
            }}
          >
            {procesando ? 'Procesando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Gasto */}
      <Dialog open={modalGasto} onClose={() => !procesandoGasto && setModalGasto(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ backgroundColor: '#ffe4e6', p: 1, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Receipt size={20} color="#e11d48" />
            </Box>
            <Typography variant="h6" fontWeight={700} color={colorText}>Nuevo gasto</Typography>
          </Box>
          <IconButton size="small" onClick={() => !procesandoGasto && setModalGasto(false)} sx={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#1e293b', color: isDark ? 'white' : 'white', '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : '#0f172a' } }}>
            <X size={16} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '20px !important' }}>
          
          <Box>
            <Typography variant="body2" fontWeight={600} mb={1} color={colorText}>Fecha del gasto<span style={{ color: '#ef4444' }}>*</span></Typography>
            <TextField
              fullWidth
              type="date"
              size="small"
              value={gastoData.fecha}
              onChange={e => setGastoData({ ...gastoData, fecha: e.target.value })}
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            />
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={600} mb={1} color={colorText}>Categoría del gasto <span style={{ color: '#ef4444' }}>*</span></Typography>
            <Select
              fullWidth
              displayEmpty
              size="small"
              value={gastoData.categoria}
              onChange={e => setGastoData({ ...gastoData, categoria: e.target.value })}
              sx={{ borderRadius: 2 }}
              startAdornment={<InputAdornment position="start"><Tag size={18} color="#9ca3af" /></InputAdornment>}
            >
              <MenuItem value="" disabled>Selecciona una categoría</MenuItem>
              <MenuItem value="servicios">Servicios Básicos</MenuItem>
              <MenuItem value="alquiler">Alquiler</MenuItem>
              <MenuItem value="sueldos">Sueldos</MenuItem>
              <MenuItem value="suministros">Suministros</MenuItem>
              <MenuItem value="otros">Otros</MenuItem>
            </Select>
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={600} mb={1} color={colorText}>Valor<span style={{ color: '#ef4444' }}>*</span></Typography>
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
              <TextField
                fullWidth
                type="number"
                placeholder="0"
                value={gastoData.valor}
                onChange={e => setGastoData({ ...gastoData, valor: e.target.value })}
                sx={{ '& fieldset': { border: 'none' } }}
                inputProps={{ min: 0, step: '0.1', style: { textAlign: 'right', padding: '12px' } }}
              />
              <Box sx={{ backgroundColor: 'action.hover', px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">Valor total</Typography>
                <Typography variant="body2" fontWeight={700} color="error.main">= Bs {formatMonto(gastoData.valor)}</Typography>
              </Box>
            </Box>
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={600} mb={1} color={colorText}>¿Quieres darle un nombre a este gasto?</Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Escríbelo aquí"
              value={gastoData.nombre}
              onChange={e => setGastoData({ ...gastoData, nombre: e.target.value })}
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            />
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={600} mb={1.5} color={colorText}>Selecciona el método de pago <span style={{ color: '#ef4444' }}>*</span></Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              {[
                { value: 'efectivo', label: 'Efectivo', icon: <Banknote size={24} /> },
                { value: 'tarjeta', label: 'Tarjeta', icon: <CreditCard size={24} /> },
                { value: 'transferencia', label: 'Transferencia bancaria', icon: <Smartphone size={24} /> },
                { value: 'otro', label: 'Otro', icon: <LayoutGrid size={24} /> },
              ].map(m => (
                <Card key={m.value} onClick={() => setGastoData({ ...gastoData, metodoPago: m.value })} sx={{ 
                  p: 2, cursor: 'pointer', textAlign: 'center', border: '2px solid', position: 'relative',
                  borderColor: gastoData.metodoPago === m.value ? '#10b981' : 'divider',
                  backgroundColor: 'transparent',
                  boxShadow: 'none', borderRadius: 2, transition: 'all 0.2s'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1, color: colorText }}>
                    {m.icon}
                  </Box>
                  <Typography variant="body2" fontWeight={600} color={gastoData.metodoPago === m.value ? colorText : 'text.secondary'}>
                    {m.label}
                  </Typography>
                  {gastoData.metodoPago === m.value && (
                    <Box sx={{ position: 'absolute', top: 0, right: 0, width: 28, height: 28, borderBottomLeftRadius: 8, backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle size={16} color="white" />
                    </Box>
                  )}
                </Card>
              ))}
            </Box>
          </Box>

        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            fullWidth
            onClick={handleCrearGasto}
            disabled={procesandoGasto || !gastoData.categoria || !gastoData.valor}
            sx={{ 
              backgroundColor: colorDisabledBg, 
              color: colorDisabledText, 
              py: 1.5, 
              borderRadius: 2, 
              textTransform: 'none', 
              fontWeight: 700, 
              fontSize: '1rem',
              '&:not(:disabled)': {
                backgroundColor: colorDarkBtn,
                color: 'white',
                '&:hover': { backgroundColor: colorDarkBtnHover }
              }
            }}
          >
            {procesandoGasto ? 'Creando...' : 'Crear gasto'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Crear Cliente */}
      <Dialog open={modalCliente} onClose={() => !procesandoCliente && setModalCliente(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ backgroundColor: 'rgba(59,130,246,0.1)', p: 1, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={20} color="#3b82f6" />
            </Box>
            <Typography variant="h6" fontWeight={700} color={colorText}>Nuevo Cliente</Typography>
          </Box>
          <IconButton size="small" onClick={() => !procesandoCliente && setModalCliente(false)} sx={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }}>
            <X size={16} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '20px !important' }}>
          
          <Box>
            <Typography variant="body2" fontWeight={600} mb={1} color={colorText}>Nombre <span style={{color: '#ef4444'}}>*</span></Typography>
            <TextField fullWidth size="small" value={nuevoCliente.nombre} onChange={e => setNuevoCliente({...nuevoCliente, nombre: e.target.value})} sx={{ '& .MuiInputBase-root': { borderRadius: 1.5 } }} />
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={600} mb={1} color={colorText}>Apellido <span style={{color: '#ef4444'}}>*</span></Typography>
            <TextField fullWidth size="small" value={nuevoCliente.apellido} onChange={e => setNuevoCliente({...nuevoCliente, apellido: e.target.value})} sx={{ '& .MuiInputBase-root': { borderRadius: 1.5 } }} />
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={600} mb={1} color={colorText}>Teléfono <span style={{color: '#ef4444'}}>*</span></Typography>
            <TextField fullWidth size="small" value={nuevoCliente.telefono} onChange={e => setNuevoCliente({...nuevoCliente, telefono: e.target.value})} sx={{ '& .MuiInputBase-root': { borderRadius: 1.5 } }} />
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={600} mb={1} color={colorText}>Correo</Typography>
            <TextField fullWidth size="small" type="email" value={nuevoCliente.correo} onChange={e => setNuevoCliente({...nuevoCliente, correo: e.target.value})} sx={{ '& .MuiInputBase-root': { borderRadius: 1.5 } }} />
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={600} mb={1} color={colorText}>Dirección</Typography>
            <TextField fullWidth size="small" value={nuevoCliente.direccion} onChange={e => setNuevoCliente({...nuevoCliente, direccion: e.target.value})} sx={{ '& .MuiInputBase-root': { borderRadius: 1.5 } }} />
          </Box>

        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            fullWidth
            onClick={handleCrearCliente}
            variant="contained"
            disabled={procesandoCliente}
            sx={{ 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              py: 1.5, 
              borderRadius: 2, 
              textTransform: 'none', 
              fontWeight: 700, 
              fontSize: '1rem',
              '&:hover': { backgroundColor: '#2563eb' } 
            }}
          >
            {procesandoCliente ? 'Guardando...' : 'Guardar Cliente'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ width: '100%', boxShadow: 3 }}>{snackbar.message}</Alert>
      </Snackbar>
      {/* MODAL TICKET */}
      <Dialog open={modalTicket} onClose={() => setModalTicket(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Ticket de Venta
          <IconButton onClick={() => setModalTicket(false)} size="small"><X size={20} /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ backgroundColor: '#f3f4f6', display: 'flex', justifyContent: 'center' }}>
          {/* Contenedor del ticket que se imprimirá */}
          {ticketData && (
            <TicketVenta 
              ref={ticketRef}
              ventaInfo={ticketData.ventaInfo}
              cliente={ticketData.cliente}
              items={ticketData.items}
              total={ticketData.total}
              descuento={ticketData.descuento}
              pagado={ticketData.pagado}
              cambio={ticketData.cambio}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={() => setModalTicket(false)} color="inherit" variant="outlined">
            Cerrar
          </Button>
          <Button 
            onClick={() => handlePrintTicket()} 
            variant="contained" 
            color="primary"
            startIcon={<Printer size={20} />}
          >
            Imprimir Ticket
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default VentasPage;
