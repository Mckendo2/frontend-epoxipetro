import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Card, Typography, Chip, IconButton, Button, TextField, InputAdornment,
  Select, MenuItem, FormControl, Divider, Snackbar, Alert, LinearProgress,
  Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, useTheme,
  Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Autocomplete
} from '@mui/material';
import {
  Search, Plus, Minus, Trash2, Banknote, Smartphone, CreditCard,
  User, Package, X, Printer, FileText, List, CheckCircle, UserPlus
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import TicketCotizacion from '../components/TicketCotizacion';
import { useAuth } from '../../../context/AuthContext';

const API_INV = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/inventario';
const API_COTIZACIONES = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/cotizaciones';
const API_VEN = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/ventas';

const formatMonto = (monto) => Number(parseFloat(monto || 0).toFixed(2)).toLocaleString('de-DE');

const CotizacionesPage = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colorDarkBtn = isDark ? theme.palette.primary.main : '#1e293b';
  const colorDarkBtnHover = isDark ? theme.palette.primary.dark : '#0f172a';
  const colorText = isDark ? theme.palette.text.primary : '#1e293b';

  const [tab, setTab] = useState(0); // 0 = Nueva Cotización, 1 = Historial
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const notify = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  // Data fetching
  const [stock, setStock] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [historial, setHistorial] = useState([]);

  const fetchBaseData = useCallback(async () => {
    try {
      const [stockRes, clientesRes] = await Promise.all([
        fetch(`${API_INV}/productos`),
        fetch(`${API_VEN}/clientes`)
      ]);
      const productosData = await stockRes.json();
      const presentaciones = productosData.flatMap(p =>
        p.presentaciones
          .filter(pr => pr.stock_tienda > 0)
          .map(pr => ({ ...pr, producto: p.nombre, categoria: p.categoria, marca: p.marca, imagen_url: p.imagen_url }))
      ).sort((a, b) => a.producto.localeCompare(b.producto));
      setStock(presentaciones);
      setClientes(await clientesRes.json());
    } catch {
      notify('Error al cargar catálogo', 'error');
    }
  }, []);

  const fetchHistorial = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_COTIZACIONES, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setHistorial(await res.json());
      }
    } catch {
      notify('Error al cargar el historial', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBaseData();
    if (tab === 1) fetchHistorial();
  }, [fetchBaseData, fetchHistorial, tab]);

  // --- Tab 0: Nueva Cotización ---
  const [carrito, setCarrito] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [adelanto, setAdelanto] = useState('');
  const [busquedaProductoTexto, setBusquedaProductoTexto] = useState('');
  const [procesando, setProcesando] = useState(false);

  const stockFiltrado = stock.filter(pr =>
    pr.producto.toLowerCase().includes(busquedaProductoTexto.toLowerCase()) ||
    pr.nombre.toLowerCase().includes(busquedaProductoTexto.toLowerCase()) ||
    pr.categoria?.toLowerCase().includes(busquedaProductoTexto.toLowerCase())
  );

  const agregarFila = (pr) => {
    if (!pr) return;
    setCarrito(prev => {
      const existente = prev.find(i => i.id === pr.id);
      if (existente) {
        return prev.map(i => i.id === pr.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      }
      return [...prev, { ...pr, cantidad: 1, precio_venta_manual: pr.precio_venta }];
    });
  };

  const quitarFila = (id) => setCarrito(prev => prev.filter(i => i.id !== id));
  
  const actualizarFila = (id, campo, valor) => {
    setCarrito(prev => prev.map(i => i.id === id ? { ...i, [campo]: valor } : i));
  };

  const totalCotizacion = carrito.reduce((acc, i) => acc + (parseFloat(i.precio_venta_manual) || 0) * (parseFloat(i.cantidad) || 0), 0);
  const saldoCotizacion = totalCotizacion - (parseFloat(adelanto) || 0);

  const limpiarFormulario = () => {
    setCarrito([]);
    setClienteId('');
    setAdelanto('');
  };

  // Ticket Modal
  const [modalTicket, setModalTicket] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const ticketRef = useRef();
  const handlePrintTicket = useReactToPrint({ contentRef: ticketRef, documentTitle: 'Ticket_Cotizacion' });

  const handleCrearCotizacion = async () => {
    if (carrito.length === 0) return notify('Añade productos a la cotización', 'warning');
    const adelantoNum = parseFloat(adelanto) || 0;
    if (adelantoNum > totalCotizacion) return notify('El adelanto no puede ser mayor al total', 'warning');

    setProcesando(true);
    try {
      const res = await fetch(`${API_COTIZACIONES}/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          cliente_id: clienteId || null,
          total: totalCotizacion,
          adelanto: adelantoNum,
          carrito: carrito.map(item => ({
            presentacion_id: item.id,
            cantidad: parseFloat(item.cantidad) || 1,
            precio: parseFloat(item.precio_venta_manual) || 0
          }))
        })
      });
      const data = await res.json();
      if (res.ok) {
        notify(`Cotización #${data.cotizacion_id} registrada`);
        
        setTicketData({
          cotizacionInfo: { id: data.cotizacion_id, fecha: new Date() },
          cliente: clientes.find(c => c.id === clienteId) || null,
          items: carrito.map(i => ({ ...i, precio_venta: i.precio_venta_manual })),
          total: totalCotizacion,
          adelanto: adelantoNum,
          saldo: saldoCotizacion
        });
        
        limpiarFormulario();
        setModalTicket(true);
      } else {
        notify(data.mensaje, 'error');
      }
    } catch {
      notify('Error de red', 'error');
    } finally {
      setProcesando(false);
    }
  };

  // --- Modal Nuevo Cliente ---
  const [modalCliente, setModalCliente] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', apellido: '', telefono: '', correo: '', direccion: '' });
  const [procesandoCliente, setProcesandoCliente] = useState(false);

  const handleCrearCliente = async () => {
    if (!nuevoCliente.nombre || !nuevoCliente.apellido || !nuevoCliente.telefono) {
      return notify('Nombre, apellido y teléfono son obligatorios', 'warning');
    }
    setProcesandoCliente(true);
    try {
      const res = await fetch(`${API_VEN}/clientes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(nuevoCliente)
      });
      const data = await res.json();
      if (res.ok) {
        notify('Cliente creado exitosamente');
        setModalCliente(false);
        setNuevoCliente({ nombre: '', apellido: '', telefono: '', correo: '', direccion: '' });
        
        // Recargar clientes
        const resClientes = await fetch(`${API_VEN}/clientes`);
        setClientes(await resClientes.json());
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

  // --- Tab 1: Historial ---
  const [modalCobro, setModalCobro] = useState(false);
  const [cotizacionCobro, setCotizacionCobro] = useState(null);
  const [metodoPagoCobro, setMetodoPagoCobro] = useState('efectivo');

  const abrirCobro = (cotizacion) => {
    setCotizacionCobro(cotizacion);
    setMetodoPagoCobro('efectivo');
    setModalCobro(true);
  };

  const handleConvertirVenta = async () => {
    setProcesando(true);
    try {
      const res = await fetch(`${API_VEN}/desde-cotizacion/${cotizacionCobro.id}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ metodo_pago: metodoPagoCobro })
      });
      const data = await res.json();
      if (res.ok) {
        notify(`Venta #${data.venta_id} generada exitosamente`);
        setModalCobro(false);
        fetchHistorial();
      } else {
        notify(data.mensaje, 'error');
      }
    } catch {
      notify('Error de red', 'error');
    } finally {
      setProcesando(false);
    }
  };

  const verTicket = async (id) => {
    try {
      const res = await fetch(`${API_COTIZACIONES}/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTicketData({
          cotizacionInfo: { id: data.id, fecha: data.created_at },
          cliente: { nombre: data.cliente || 'General', apellido: '', telefono: '' },
          items: data.detalle.map(d => ({
            producto: d.producto,
            nombre: d.presentacion,
            cantidad: d.cantidad,
            precio_venta: d.precio_unitario
          })),
          total: data.total,
          adelanto: data.adelanto,
          saldo: data.saldo
        });
        setModalTicket(true);
      } else {
        notify('Error al cargar detalle del ticket', 'error');
      }
    } catch {
      notify('Error de conexión', 'error');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3, height: '100vh', overflow: 'hidden' }}>
      
      {/* Header & Tabs */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="text.primary">Cotizaciones</Typography>
          <Typography variant="body1" color="text.secondary">Gestiona proformas y conviértelas en ventas</Typography>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)}>
          <Tab icon={<FileText size={20} />} iconPosition="start" label="Nueva Cotización" sx={{ fontWeight: 600, textTransform: 'none', fontSize: '1rem' }} />
          <Tab icon={<List size={20} />} iconPosition="start" label="Historial de Cotizaciones" sx={{ fontWeight: 600, textTransform: 'none', fontSize: '1rem' }} />
        </Tabs>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, overflowY: 'auto', pb: 4 }}>
        
        {/* --- TAB 0: Nueva Cotización --- */}
        {tab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Cabecera del Documento */}
            <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <Typography variant="h6" fontWeight={700} mb={2}>Datos del Cliente</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
                <FormControl fullWidth>
                  <Typography variant="body2" fontWeight={600} mb={1}>Seleccionar Cliente</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Select size="small" value={clienteId} onChange={e => setClienteId(e.target.value)} displayEmpty sx={{ flex: 1 }}>
                      <MenuItem value=""><em>Cliente General (Sin registrar)</em></MenuItem>
                      {clientes.map(c => <MenuItem key={c.id} value={c.id}>{c.nombre} {c.apellido}</MenuItem>)}
                    </Select>
                    <Tooltip title="Nuevo Cliente">
                      <Button variant="outlined" onClick={() => setModalCliente(true)} sx={{ minWidth: 40, p: 1, borderColor: 'divider', color: colorText }}>
                        <UserPlus size={20} />
                      </Button>
                    </Tooltip>
                  </Box>
                </FormControl>

                <FormControl fullWidth>
                  <Typography variant="body2" fontWeight={600} mb={1}>Adelanto / A cuenta (Bs)</Typography>
                  <TextField 
                    size="small" type="number" placeholder="Ej. 50" 
                    value={adelanto} onChange={e => setAdelanto(e.target.value)}
                    slotProps={{ htmlInput: { min: 0 } }}
                  />
                </FormControl>
              </Box>
            </Card>

            {/* Detalle de Productos */}
            <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6" fontWeight={700}>Detalle de Productos</Typography>
              
              <TextField
                placeholder="Buscar producto por nombre o categoría..."
                size="small"
                fullWidth
                value={busquedaProductoTexto}
                onChange={e => setBusquedaProductoTexto(e.target.value)}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={18} color="#9ca3af" /></InputAdornment> } }}
              />
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 2, mt: 1, maxHeight: 350, overflowY: 'auto', p: 1, bgcolor: 'background.default', borderRadius: 2 }}>
                {stockFiltrado.map(pr => {
                  const enCarrito = carrito.find(i => i.id === pr.id);
                  return (
                    <Card
                      key={pr.id}
                      onClick={() => agregarFila(pr)}
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
                        '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(99,102,241,0.15)' }
                      }}
                    >
                      {enCarrito && (
                        <Box sx={{ position: 'absolute', top: -6, right: -6, bgcolor: '#1e293b', color: 'white', borderRadius: 2, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', zIndex: 1 }}>
                          {enCarrito.cantidad}
                        </Box>
                      )}
                      <Box sx={{ width: 80, height: 80, mb: 1, borderRadius: 2, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: pr.imagen_url ? 'transparent' : 'rgba(99,102,241,0.08)' }}>
                        {pr.imagen_url ? (
                          <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${pr.imagen_url}`} alt={pr.producto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Package size={32} color="#6366f1" opacity={0.6} />
                        )}
                      </Box>
                      <Typography variant="body2" fontWeight={800} color="text.primary">Bs {formatMonto(pr.precio_venta)}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 0.5, lineHeight: 1.2, height: 30, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {pr.producto}
                      </Typography>
                    </Card>
                  );
                })}
              </Box>

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mt: 1 }}>
                <Table>
                  <TableHead sx={{ backgroundColor: 'background.default' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Producto</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} width={120}>Cantidad</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} width={150}>Precio (Bs)</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Subtotal</TableCell>
                      <TableCell width={60}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {carrito.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                          Añade productos usando el buscador de arriba
                        </TableCell>
                      </TableRow>
                    ) : (
                      carrito.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {item.imagen_url ? (
                                <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${item.imagen_url}`} alt={item.producto} style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} />
                              ) : (
                                <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Package size={20} color="#9ca3af" />
                                </Box>
                              )}
                              <Box>
                                <Typography variant="body2" fontWeight={600}>{item.producto}</Typography>
                                <Typography variant="caption" color="text.secondary">{item.nombre}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <TextField 
                              size="small" type="number" value={item.cantidad} 
                              onChange={e => actualizarFila(item.id, 'cantidad', e.target.value)}
                              slotProps={{ htmlInput: { min: 1 } }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField 
                              size="small" type="number" value={item.precio_venta_manual} 
                              onChange={e => actualizarFila(item.id, 'precio_venta_manual', e.target.value)}
                              slotProps={{ htmlInput: { min: 0 } }}
                            />
                          </TableCell>
                          <TableCell sx={{ textAlign: 'right', fontWeight: 600 }}>
                            Bs {formatMonto(item.cantidad * item.precio_venta_manual)}
                          </TableCell>
                          <TableCell>
                            <IconButton color="error" size="small" onClick={() => quitarFila(item.id)}>
                              <Trash2 size={18} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Totales */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Box sx={{ width: 300, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Total a Pagar:</Typography>
                    <Typography fontWeight={700}>Bs {formatMonto(totalCotizacion)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="success.main">Adelanto (A cuenta):</Typography>
                    <Typography color="success.main" fontWeight={600}>- Bs {formatMonto(adelanto)}</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight={800}>Saldo Restante:</Typography>
                    <Typography variant="h6" fontWeight={800} color="primary.main">Bs {formatMonto(saldoCotizacion)}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      size="large"
                      onClick={limpiarFormulario}
                      disabled={procesando || carrito.length === 0}
                      sx={{ borderRadius: 2, py: 1.5, fontWeight: 700, textTransform: 'none', fontSize: '1rem', color: 'error.main', borderColor: 'error.main' }}
                    >
                      Limpiar
                    </Button>
                    <Button 
                      variant="contained" 
                      fullWidth 
                      size="large"
                      disabled={procesando || carrito.length === 0}
                      onClick={handleCrearCotizacion}
                      sx={{ borderRadius: 2, py: 1.5, fontWeight: 700, textTransform: 'none', fontSize: '1rem', bgcolor: colorDarkBtn, '&:hover': { bgcolor: colorDarkBtnHover } }}
                    >
                      Emitir Cotización
                    </Button>
                  </Box>
                </Box>
              </Box>

            </Card>
          </Box>
        )}

        {/* --- TAB 1: Historial --- */}
        {tab === 1 && (
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', overflow: 'hidden' }}>
            {loading ? <LinearProgress /> : <Box sx={{ height: 4 }} />}
            <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Cliente</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Adelanto</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Saldo Pendiente</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Acción</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historial.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>No hay cotizaciones registradas</TableCell>
                    </TableRow>
                  ) : (
                    historial.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>#{row.id}</TableCell>
                        <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{row.cliente || 'Cliente General'}</TableCell>
                        <TableCell>Bs {formatMonto(row.total)}</TableCell>
                        <TableCell sx={{ color: 'success.main' }}>Bs {formatMonto(row.adelanto)}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'error.main' }}>Bs {formatMonto(row.saldo)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={row.estado.toUpperCase()} 
                            size="small" 
                            color={row.estado === 'pendiente' ? 'warning' : row.estado === 'completada' ? 'success' : 'default'}
                            sx={{ fontWeight: 700, borderRadius: 1 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title="Ver/Imprimir Ticket">
                              <IconButton size="small" onClick={() => verTicket(row.id)} color="primary">
                                <Printer size={18} />
                              </IconButton>
                            </Tooltip>
                            {row.estado === 'pendiente' && (
                              <Button 
                                variant="contained" 
                                size="small" 
                                color="primary"
                                startIcon={<CheckCircle size={16} />}
                                onClick={() => abrirCobro(row)}
                                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, px: 2 }}
                              >
                                Cobrar
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}

      </Box>

      {/* Modal Cobro de Cotización */}
      <Dialog open={modalCobro} onClose={() => !procesando && setModalCobro(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Convertir a Venta</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {cotizacionCobro && (
            <>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Vas a cobrar el saldo pendiente de la cotización <strong>#{cotizacionCobro.id}</strong>. Al confirmar, el inventario se descontará.
              </Alert>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: 'background.default', p: 2, borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">Saldo a Cobrar:</Typography>
                <Typography variant="h6" fontWeight={800} color="primary.main">Bs {formatMonto(cotizacionCobro.saldo)}</Typography>
              </Box>
              
              <Typography variant="body2" fontWeight={600} mt={1}>Método de Pago para el Saldo</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                {['efectivo', 'tarjeta', 'transferencia', 'qr'].map((mp) => (
                  <Button
                    key={mp}
                    variant={metodoPagoCobro === mp ? 'contained' : 'outlined'}
                    onClick={() => setMetodoPagoCobro(mp)}
                    sx={{ textTransform: 'capitalize', borderRadius: 2, py: 1 }}
                  >
                    {mp}
                  </Button>
                ))}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setModalCobro(false)} disabled={procesando} sx={{ color: 'text.secondary' }}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={handleConvertirVenta} 
            disabled={procesando}
            sx={{ bgcolor: colorDarkBtn, '&:hover': { bgcolor: colorDarkBtnHover }, borderRadius: 2, px: 3 }}
          >
            {procesando ? 'Procesando...' : 'Cobrar y Entregar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Ticket Cotización */}
      <Dialog open={modalTicket} onClose={() => setModalTicket(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>Cotización Emitida</Typography>
          <IconButton size="small" onClick={() => setModalTicket(false)}><X size={18} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f8fafc' }}>
          <Box sx={{ width: '100%', maxWidth: 350, backgroundColor: 'white', p: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', mb: 3 }}>
            <TicketCotizacion data={ticketData} ref={ticketRef} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={handlePrintTicket}
            startIcon={<Printer size={20} />}
            sx={{ backgroundColor: colorDarkBtn, color: 'white', py: 1.5, px: 4, borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: '1rem', '&:hover': { backgroundColor: colorDarkBtnHover } }}
          >
            Imprimir Ticket
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2, fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Modal Nuevo Cliente */}
      <Dialog open={modalCliente} onClose={() => setModalCliente(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Registrar Nuevo Cliente</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField 
            label="Nombre *" size="small" fullWidth 
            value={nuevoCliente.nombre} onChange={e => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })} 
          />
          <TextField 
            label="Apellido *" size="small" fullWidth 
            value={nuevoCliente.apellido} onChange={e => setNuevoCliente({ ...nuevoCliente, apellido: e.target.value })} 
          />
          <TextField 
            label="Teléfono / C.I. / NIT *" size="small" fullWidth 
            value={nuevoCliente.telefono} onChange={e => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })} 
          />
          <TextField 
            label="Correo (Opcional)" size="small" fullWidth 
            value={nuevoCliente.correo} onChange={e => setNuevoCliente({ ...nuevoCliente, correo: e.target.value })} 
          />
          <TextField 
            label="Dirección (Opcional)" size="small" fullWidth 
            value={nuevoCliente.direccion} onChange={e => setNuevoCliente({ ...nuevoCliente, direccion: e.target.value })} 
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setModalCliente(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCrearCliente} disabled={procesandoCliente} sx={{ bgcolor: colorDarkBtn, '&:hover': { bgcolor: colorDarkBtnHover } }}>
            {procesandoCliente ? 'Guardando...' : 'Guardar Cliente'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default CotizacionesPage;
