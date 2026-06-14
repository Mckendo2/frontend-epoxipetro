import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Button, TextField, InputAdornment,
  Divider, Snackbar, Alert, LinearProgress, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Tabs, Tab, Select, MenuItem, FormControl
} from '@mui/material';
import {
  Search, History, Eye, XCircle, Banknote, Receipt, TrendingDown,
  TrendingUp, CreditCard, Smartphone, Users, CheckCircle, CalendarDays, Printer, Scale
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import TicketVenta from '../../ventas/components/TicketVenta';

const API_VEN = 'http://localhost:3000/api/ventas';
const API_GAS = 'http://localhost:3000/api/gastos';

const METODOS_PAGO = [
  { value: 'efectivo',      label: 'Efectivo',      icon: <Banknote size={16} /> },
  { value: 'tarjeta',       label: 'Tarjeta',        icon: <CreditCard size={16} /> },
  { value: 'transferencia', label: 'Transferencia',  icon: <Smartphone size={16} /> },
  { value: 'qr',            label: 'QR',             icon: <Smartphone size={16} /> },
];
const METODO_COLOR = { efectivo: '#10b981', tarjeta: '#6366f1', transferencia: '#f59e0b', qr: '#3b82f6' };

const formatMonto = (monto) => Number(parseFloat(monto || 0).toFixed(2)).toLocaleString('de-DE');

const getLocalDateString = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const MovimientosPage = () => {
  const [tabIndex, setTabIndex] = useState(0); // 0 = Ingresos (Ventas), 1 = Egresos (Gastos), 2 = Por Cobrar
  const [ventas, setVentas] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Range states
  const [rangoFecha, setRangoFecha] = useState('diario');
  const [fechaInicio, setFechaInicio] = useState(() => getLocalDateString(new Date()));
  const [fechaFin, setFechaFin] = useState(() => getLocalDateString(new Date()));

  // Detalle
  const [ventaDetalle, setVentaDetalle] = useState(null);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [anulando, setAnulando] = useState(false);

  // Ticket
  const [modalTicket, setModalTicket] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const ticketRef = React.useRef();
  const handlePrintTicket = useReactToPrint({ contentRef: ticketRef, documentTitle: 'Ticket_Venta' });

  // Abonos
  const [modalAbono, setModalAbono] = useState(false);
  const [abonoData, setAbonoData] = useState(null);
  const [abonoForm, setAbonoForm] = useState({ monto: '', metodo_pago: 'efectivo', nota: '' });
  const [registrandoAbono, setRegistrandoAbono] = useState(false);

  const notify = useCallback((message, severity = 'success') => setSnackbar({ open: true, message, severity }), []);

  const fetchVentas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_VEN}/?limite=100`);
      setVentas(await res.json());
    } catch {
      notify('Error al cargar historial de ventas', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  const fetchGastos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_GAS);
      setGastos(await res.json());
    } catch {
      notify('Error al cargar gastos', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchVentas();
    fetchGastos();
  }, [fetchVentas, fetchGastos]);

  const verDetalle = async (id) => {
    setLoadingDetalle(true);
    setModalDetalle(true);
    try {
      const res = await fetch(`${API_VEN}/${id}`);
      setVentaDetalle(await res.json());
    } catch {
      notify('Error al cargar detalle', 'error');
      setModalDetalle(false);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const verTicket = async (id) => {
    try {
      const res = await fetch(`${API_VEN}/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTicketData({
          ventaInfo: { id: data.id, fecha: data.created_at, usuario: data.usuario },
          cliente: { nombre: data.cliente || 'General', apellido: '', telefono: '' },
          items: data.detalle.map(d => ({
            producto: d.producto,
            nombre: d.presentacion,
            cantidad: d.cantidad,
            precio_venta: d.precio_unitario
          })),
          total: parseFloat(data.total),
          descuento: parseFloat(data.descuento || 0),
          pagado: parseFloat(data.total),
          cambio: 0
        });
        setModalTicket(true);
      } else {
        notify('Error al cargar ticket', 'error');
      }
    } catch {
      notify('Error de red', 'error');
    }
  };

  const anularVenta = async (id) => {
    if (!window.confirm(`¿Anular la venta #${id}? Se revertirá el stock.`)) return;
    setAnulando(true);
    try {
      const res = await fetch(`${API_VEN}/${id}/anular`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        notify(`Venta #${id} anulada y stock revertido`);
        setModalDetalle(false);
        fetchVentas();
      } else {
        notify(data.mensaje, 'error');
      }
    } catch {
      notify('Error de conexión', 'error');
    } finally {
      setAnulando(false);
    }
  };

  const abrirModalAbono = (venta) => {
    setAbonoData(venta);
    setAbonoForm({ monto: venta.saldo_pendiente, metodo_pago: 'efectivo', nota: '' });
    setModalAbono(true);
  };

  const registrarAbono = async () => {
    if (!abonoForm.monto || abonoForm.monto <= 0) return notify('Ingresa un monto válido', 'warning');
    if (parseFloat(abonoForm.monto) > parseFloat(abonoData.saldo_pendiente)) return notify('El abono no puede superar el saldo pendiente', 'warning');

    setRegistrandoAbono(true);
    try {
      const res = await fetch(`${API_VEN}/${abonoData.id}/abono`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(abonoForm)
      });
      const data = await res.json();
      if (res.ok) {
        notify(`Abono registrado exitosamente`);
        setModalAbono(false);
        fetchVentas();
      } else {
        notify(data.mensaje, 'error');
      }
    } catch {
      notify('Error de conexión al registrar abono', 'error');
    } finally {
      setRegistrandoAbono(false);
    }
  };

  const cumpleRango = (fechaStr) => {
    if (!fechaStr) return false;
    const d = new Date(fechaStr);
    const dY = d.getFullYear(), dM = d.getMonth(), dD = d.getDate();
    
    if (rangoFecha === 'personalizado') {
      const [sY, sM, sD] = fechaInicio.split('-').map(Number);
      const [eY, eM, eD] = fechaFin.split('-').map(Number);
      const start = new Date(sY, sM - 1, sD, 0, 0, 0);
      const end = new Date(eY, eM - 1, eD, 23, 59, 59, 999);
      return d >= start && d <= end;
    }

    const [rY, rMonth, rD] = fechaInicio.split('-').map(Number);
    const rM = rMonth - 1;
    const ref = new Date(rY, rM, rD);

    if (rangoFecha === 'diario') return dY === rY && dM === rM && dD === rD;
    if (rangoFecha === 'mensual') return dY === rY && dM === rM;
    if (rangoFecha === 'anual') return dY === rY;
    
    if (rangoFecha === 'semanal') {
      const day = ref.getDay();
      const diff = ref.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(ref.setDate(diff));
      startOfWeek.setHours(0,0,0,0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23,59,59,999);
      return d >= startOfWeek && d <= endOfWeek;
    }
    return true;
  };

  const ventasRango = ventas.filter(v => cumpleRango(v.created_at));
  const gastosRango = gastos.filter(g => cumpleRango(g.fecha));

  const ventasFiltradas = ventasRango.filter(v =>
    String(v.id).includes(busqueda) ||
    (v.cliente || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (v.metodo_pago || '').includes(busqueda.toLowerCase())
  );

  const totalIngresos = ventasRango
    .filter(v => v.estado === 'completada' && (v.tipo_venta !== 'credito' || v.estado_pago === 'pagado'))
    .reduce((acc, v) => acc + parseFloat(v.total), 0);

  const totalEgresos = gastosRango.reduce((acc, g) => acc + parseFloat(g.valor), 0);
  const balanceRango = totalIngresos - totalEgresos;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: 'calc(100vh - 110px)', minHeight: 600 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary">Movimientos</Typography>
          <Typography variant="body2" color="text.secondary">Historial de ingresos y egresos</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select 
              value={rangoFecha} 
              onChange={e => setRangoFecha(e.target.value)} 
              sx={{ borderRadius: 1.5, backgroundColor: 'background.paper' }}
            >
              <MenuItem value="diario">Diario</MenuItem>
              <MenuItem value="semanal">Semanal</MenuItem>
              <MenuItem value="mensual">Mensual</MenuItem>
              <MenuItem value="anual">Anual</MenuItem>
              <MenuItem value="personalizado">Personalizado</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: 'background.paper', borderRadius: 1.5, border: '1px solid', borderColor: 'divider', px: 1 }}>
            <CalendarDays size={18} color="#6b7280" />
            <TextField 
              type="date" 
              size="small" 
              value={fechaInicio} 
              onChange={e => setFechaInicio(e.target.value)} 
              sx={{ '& fieldset': { border: 'none' }, '& input': { py: 1, px: 1 } }} 
            />
          </Box>
          
          {rangoFecha === 'personalizado' && (
            <>
              <Typography variant="body2" color="text.secondary">al</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: 'background.paper', borderRadius: 1.5, border: '1px solid', borderColor: 'divider', px: 1 }}>
                <CalendarDays size={18} color="#6b7280" />
                <TextField 
                  type="date" 
                  size="small" 
                  value={fechaFin} 
                  onChange={e => setFechaFin(e.target.value)} 
                  sx={{ '& fieldset': { border: 'none' }, '& input': { py: 1, px: 1 } }} 
                />
              </Box>
            </>
          )}
        </Box>
      </Box>

      <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ borderBottom: 'none' }} variant="scrollable" scrollButtons="auto">
          <Tab icon={<TrendingUp size={18} />} iconPosition="start" label="Ingresos (Ventas)" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40 }} />
          <Tab icon={<TrendingDown size={18} />} iconPosition="start" label="Egresos (Gastos)" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40 }} />
          <Tab icon={<Users size={18} />} iconPosition="start" label="Por Cobrar" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40 }} />
      </Tabs>

      <Divider />

      {tabIndex === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minHeight: 0 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Card sx={{ flex: 1, p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: 1.5, backgroundColor: 'rgba(16,185,129,0.12)', color: '#10b981' }}><TrendingUp size={20} /></Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Ingresos (Rango)</Typography>
                <Typography variant="h5" fontWeight={700}>Bs. {formatMonto(totalIngresos)}</Typography>
              </Box>
            </Card>
            <Card sx={{ flex: 1, p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: 1.5, backgroundColor: 'rgba(239,68,68,0.12)', color: '#ef4444' }}><TrendingDown size={20} /></Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Egresos (Gastos)</Typography>
                <Typography variant="h5" fontWeight={700}>Bs. {formatMonto(totalEgresos)}</Typography>
              </Box>
            </Card>
            <Card sx={{ flex: 1, p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: 1.5, backgroundColor: balanceRango >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: balanceRango >= 0 ? '#10b981' : '#ef4444' }}><Scale size={20} /></Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Balance (Ing. - Egr.)</Typography>
                <Typography variant="h5" fontWeight={700} color={balanceRango >= 0 ? 'success.main' : 'error.main'}>Bs. {formatMonto(balanceRango)}</Typography>
              </Box>
            </Card>
            <Card sx={{ flex: 1, p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: 1.5, backgroundColor: 'rgba(99,102,241,0.12)', color: '#6366f1' }}><Receipt size={20} /></Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Ventas (Rango)</Typography>
                <Typography variant="h5" fontWeight={700}>
                  {ventasRango.filter(v => v.estado === 'completada').length}
                </Typography>
              </Box>
            </Card>
            <Card sx={{ flex: 1, p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: 1.5, backgroundColor: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}><History size={20} /></Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Total registros</Typography>
                <Typography variant="h5" fontWeight={700}>{ventasRango.length}</Typography>
              </Box>
            </Card>
          </Box>

          <TextField
            placeholder="Buscar por N° venta, cliente o método de pago..."
            size="small" fullWidth value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={18} color="#9ca3af" /></InputAdornment> } }}
          />

          {loading && <LinearProgress sx={{ borderRadius: 1 }} />}
          
          <Card sx={{ flex: 1, overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: '100%' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ backgroundColor: 'background.default', fontWeight: 700, color: 'text.secondary' }}># Venta</TableCell>
                    <TableCell sx={{ backgroundColor: 'background.default', fontWeight: 700, color: 'text.secondary' }}>Fecha</TableCell>
                    <TableCell sx={{ backgroundColor: 'background.default', fontWeight: 700, color: 'text.secondary' }}>Cliente</TableCell>
                    <TableCell sx={{ backgroundColor: 'background.default', fontWeight: 700, color: 'text.secondary' }}>Ítems</TableCell>
                    <TableCell sx={{ backgroundColor: 'background.default', fontWeight: 700, color: 'text.secondary' }}>Método</TableCell>
                    <TableCell sx={{ backgroundColor: 'background.default', fontWeight: 700, color: 'text.secondary' }}>Total</TableCell>
                    <TableCell sx={{ backgroundColor: 'background.default', fontWeight: 700, color: 'text.secondary' }}>Estado</TableCell>
                    <TableCell sx={{ backgroundColor: 'background.default', fontWeight: 700, color: 'text.secondary', textAlign: 'right' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ventasFiltradas.length === 0 && !loading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          <History size={40} color="#9ca3af" />
                          <Typography color="text.secondary">No hay ventas registradas</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : ventasFiltradas.map(v => {
                    const fecha = new Date(v.created_at);
                    const esHoy = fecha.toDateString() === new Date().toDateString();
                    return (
                      <TableRow key={v.id} hover sx={{ '& td': { borderColor: 'divider' } }}>
                        <TableCell><Typography variant="body2" fontWeight={700} color="primary.main">#{v.id}</Typography></TableCell>
                        <TableCell>
                          <Typography variant="body2">{fecha.toLocaleDateString('es-BO')}</Typography>
                          <Typography variant="caption" color={esHoy ? '#10b981' : 'text.disabled'}>
                            {esHoy ? 'Hoy · ' : ''}{fecha.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </TableCell>
                        <TableCell><Typography variant="body2">{v.cliente?.trim() || 'Cliente general'}</Typography></TableCell>
                        <TableCell><Chip label={`${v.cantidad_items} ítem(s)`} size="small" sx={{ backgroundColor: 'action.hover', color: 'text.secondary', fontSize: '0.7rem' }} /></TableCell>
                        <TableCell>
                          <Chip label={METODOS_PAGO.find(m => m.value === v.metodo_pago)?.label || v.metodo_pago} size="small"
                            sx={{ backgroundColor: `${METODO_COLOR[v.metodo_pago]}20`, color: METODO_COLOR[v.metodo_pago], fontWeight: 600, fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>Bs. {formatMonto(v.total)}</Typography>
                          {parseFloat(v.descuento) > 0 && <Typography variant="caption" color="error.main">-Bs. {formatMonto(v.descuento)}</Typography>}
                        </TableCell>
                        <TableCell>
                          <Chip label={v.estado} size="small" sx={{
                            backgroundColor: v.estado === 'completada' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                            color: v.estado === 'completada' ? '#10b981' : '#ef4444',
                            fontWeight: 600, fontSize: '0.7rem', textTransform: 'capitalize', mb: 0.5
                          }} />
                          {v.tipo_venta === 'credito' && (
                            <Chip label={v.estado_pago} size="small" sx={{
                              backgroundColor: v.estado_pago === 'pagado' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                              color: v.estado_pago === 'pagado' ? '#10b981' : '#f59e0b',
                              fontWeight: 600, fontSize: '0.7rem', textTransform: 'capitalize', display: 'block'
                            }} />
                          )}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right' }}>
                          <Tooltip title="Ver/Imprimir Ticket">
                            <IconButton size="small" onClick={() => verTicket(v.id)} color="primary">
                              <Printer size={15} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Ver detalle">
                            <IconButton size="small" onClick={() => verDetalle(v.id)} sx={{ color: 'text.secondary' }}>
                              <Eye size={15} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>
      )}

      {tabIndex === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minHeight: 0 }}>
          <TextField
            placeholder="Buscar gasto por nombre, categoría..."
            size="small" fullWidth value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={18} color="#9ca3af" /></InputAdornment> } }}
          />

          {loading && <LinearProgress sx={{ borderRadius: 1 }} />}
          
          <Card sx={{ flex: 1, overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: '100%' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ backgroundColor: 'background.default', fontWeight: 700, color: 'text.secondary' }}>Fecha</TableCell>
                    <TableCell sx={{ backgroundColor: 'background.default', fontWeight: 700, color: 'text.secondary' }}>Categoría</TableCell>
                    <TableCell sx={{ backgroundColor: 'background.default', fontWeight: 700, color: 'text.secondary' }}>Nombre / Motivo</TableCell>
                    <TableCell sx={{ backgroundColor: 'background.default', fontWeight: 700, color: 'text.secondary' }}>Método</TableCell>
                    <TableCell sx={{ backgroundColor: 'background.default', fontWeight: 700, color: 'text.secondary' }}>Valor</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {gastos.filter(g => 
                    (g.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) || 
                    g.categoria.toLowerCase().includes(busqueda.toLowerCase()) ||
                    String(g.id).includes(busqueda)
                  ).length === 0 && !loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          <TrendingDown size={40} color="#9ca3af" />
                          <Typography color="text.secondary">No hay gastos registrados</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : gastos.filter(g => 
                    (g.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) || 
                    g.categoria.toLowerCase().includes(busqueda.toLowerCase()) ||
                    String(g.id).includes(busqueda)
                  ).map(g => {
                    const fecha = new Date(g.fecha);
                    return (
                      <TableRow key={g.id} hover sx={{ '& td': { borderColor: 'divider' } }}>
                        <TableCell><Typography variant="body2">{fecha.toLocaleDateString('es-BO', { timeZone: 'UTC' })}</Typography></TableCell>
                        <TableCell><Chip label={g.categoria} size="small" sx={{ textTransform: 'capitalize', fontSize: '0.7rem' }} /></TableCell>
                        <TableCell><Typography variant="body2">{g.nombre || '-'}</Typography></TableCell>
                        <TableCell>
                          <Chip label={METODOS_PAGO.find(m => m.value === g.metodo_pago)?.label || g.metodo_pago} size="small"
                            sx={{ backgroundColor: `${METODO_COLOR[g.metodo_pago] || '#9ca3af'}20`, color: METODO_COLOR[g.metodo_pago] || '#9ca3af', fontWeight: 600, fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell><Typography variant="body2" fontWeight={700} color="error.main">Bs. {formatMonto(g.valor)}</Typography></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>
      )}

      {tabIndex === 2 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minHeight: 0 }}>
          <TextField
            placeholder="Buscar por cliente o N° de venta..."
            size="small" fullWidth value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={18} color="#9ca3af" /></InputAdornment> } }}
          />

          {loading && <LinearProgress sx={{ borderRadius: 1 }} />}
          
          <Card sx={{ flex: 1, overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: '100%' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ backgroundColor: 'background.default', fontWeight: 700, color: 'text.secondary' }}># Venta</TableCell>
                    <TableCell sx={{ backgroundColor: 'background.default', fontWeight: 700, color: 'text.secondary' }}>Fecha</TableCell>
                    <TableCell sx={{ backgroundColor: 'background.default', fontWeight: 700, color: 'text.secondary' }}>Cliente</TableCell>
                    <TableCell sx={{ backgroundColor: 'background.default', fontWeight: 700, color: 'text.secondary' }}>Total</TableCell>
                    <TableCell sx={{ backgroundColor: 'background.default', fontWeight: 700, color: 'text.secondary' }}>Abonado</TableCell>
                    <TableCell sx={{ backgroundColor: 'background.default', fontWeight: 700, color: 'text.secondary' }}>Saldo</TableCell>
                    <TableCell sx={{ backgroundColor: 'background.default', fontWeight: 700, color: 'text.secondary', textAlign: 'right' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ventas.filter(v => v.tipo_venta === 'credito' && v.estado_pago === 'pendiente' && (
                    String(v.id).includes(busqueda) || (v.cliente || '').toLowerCase().includes(busqueda.toLowerCase())
                  )).length === 0 && !loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          <CheckCircle size={40} color="#10b981" />
                          <Typography color="text.secondary">No hay cuentas por cobrar</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : ventas.filter(v => v.tipo_venta === 'credito' && v.estado_pago === 'pendiente' && (
                    String(v.id).includes(busqueda) || (v.cliente || '').toLowerCase().includes(busqueda.toLowerCase())
                  )).map(v => {
                    const fecha = new Date(v.created_at);
                    return (
                      <TableRow key={v.id} hover sx={{ '& td': { borderColor: 'divider' } }}>
                        <TableCell><Typography variant="body2" fontWeight={700} color="primary.main">#{v.id}</Typography></TableCell>
                        <TableCell>
                          <Typography variant="body2">{fecha.toLocaleDateString('es-BO')}</Typography>
                        </TableCell>
                        <TableCell><Typography variant="body2" fontWeight={600}>{v.cliente?.trim() || 'Cliente general'}</Typography></TableCell>
                        <TableCell><Typography variant="body2" fontWeight={600}>Bs. {formatMonto(v.total)}</Typography></TableCell>
                        <TableCell><Typography variant="body2" color="success.main">Bs. {formatMonto(v.monto_pagado)}</Typography></TableCell>
                        <TableCell><Typography variant="body2" fontWeight={700} color="error.main">Bs. {formatMonto(v.saldo_pendiente)}</Typography></TableCell>
                        <TableCell sx={{ textAlign: 'right' }}>
                          <Button size="small" variant="contained" color="success" onClick={() => abrirModalAbono(v)} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}>
                            Abonar
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>
      )}

      {/* Modal detalle de venta */}
      <Dialog open={modalDetalle} onClose={() => setModalDetalle(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Receipt size={20} color="#6366f1" />
            {ventaDetalle ? `Venta #${ventaDetalle.id}` : 'Cargando...'}
          </Box>
          {ventaDetalle?.estado === 'completada' && (
            <Chip label={ventaDetalle.estado_pago === 'pagado' ? 'Pagada' : 'Por Cobrar'} size="small" sx={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 600 }} />
          )}
          {ventaDetalle?.estado === 'anulada' && (
            <Chip label="Anulada" size="small" sx={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 600 }} />
          )}
        </DialogTitle>
        <DialogContent dividers>
          {loadingDetalle ? <LinearProgress /> : ventaDetalle && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, backgroundColor: 'background.default', p: 2, borderRadius: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Fecha</Typography>
                  <Typography variant="body2" fontWeight={600}>{new Date(ventaDetalle.created_at).toLocaleString('es-BO')}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Cliente</Typography>
                  <Typography variant="body2" fontWeight={600}>{ventaDetalle.cliente || 'Cliente general'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Método de pago</Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>{ventaDetalle.metodo_pago}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Vendedor</Typography>
                  <Typography variant="body2" fontWeight={600}>{ventaDetalle.usuario || '-'}</Typography>
                </Box>
              </Box>

              <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>Productos</Typography>
              <Table size="small" sx={{ '& th, & td': { borderColor: 'divider' } }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right">Cant.</TableCell>
                    <TableCell align="right">Precio</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ventaDetalle.detalle?.map(d => (
                    <TableRow key={d.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{d.producto}</Typography>
                        <Typography variant="caption" color="text.secondary">{d.presentacion}</Typography>
                      </TableCell>
                      <TableCell align="right">{Number(d.cantidad)}</TableCell>
                      <TableCell align="right">{formatMonto(d.precio_unitario)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMonto(d.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                  {parseFloat(ventaDetalle.descuento) > 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="right" sx={{ color: 'error.main', fontWeight: 600 }}>Descuento</TableCell>
                      <TableCell align="right" sx={{ color: 'error.main', fontWeight: 600 }}>- {formatMonto(ventaDetalle.descuento)}</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell colSpan={3} align="right"><Typography fontWeight={700}>Total</Typography></TableCell>
                    <TableCell align="right"><Typography fontWeight={700} color="primary.main">Bs. {formatMonto(ventaDetalle.total)}</Typography></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          {ventaDetalle?.estado === 'completada' && (
            <Button color="error" disabled={anulando} onClick={() => anularVenta(ventaDetalle.id)} startIcon={<XCircle size={18} />}>
              {anulando ? 'Anulando...' : 'Anular Venta'}
            </Button>
          )}
          <Button onClick={() => setModalDetalle(false)} variant="outlined">Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Abono */}
      <Dialog open={modalAbono} onClose={() => setModalAbono(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Registrar Abono</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {abonoData && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Venta #{abonoData.id}</Typography>
                <Typography variant="body2" fontWeight={600}>{abonoData.cliente || 'Cliente general'}</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary">Saldo Pendiente</Typography>
                <Typography variant="body1" fontWeight={700} color="error.main">Bs. {formatMonto(abonoData.saldo_pendiente)}</Typography>
              </Box>
            </Box>
          )}
          <TextField
            label="Monto a abonar (Bs.)"
            type="number"
            autoFocus
            fullWidth
            value={abonoForm.monto}
            onChange={e => setAbonoForm({ ...abonoForm, monto: e.target.value })}
            InputProps={{ inputProps: { min: 0.1, step: 0.1, max: abonoData?.saldo_pendiente } }}
          />
          <FormControl fullWidth>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>Método de Pago</Typography>
            <Select
              value={abonoForm.metodo_pago}
              onChange={e => setAbonoForm({ ...abonoForm, metodo_pago: e.target.value })}
            >
              {METODOS_PAGO.map(m => (
                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalAbono(false)} color="inherit">Cancelar</Button>
          <Button onClick={registrarAbono} variant="contained" color="success" disabled={registrandoAbono}>
            {registrandoAbono ? 'Registrando...' : 'Confirmar Abono'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Ticket Venta */}
      <Dialog open={modalTicket} onClose={() => setModalTicket(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>Ticket de Venta</Typography>
          <IconButton size="small" onClick={() => setModalTicket(false)}><XCircle size={18} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f8fafc' }}>
          <Box sx={{ width: '100%', maxWidth: 350, backgroundColor: 'white', p: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', mb: 3 }}>
            <TicketVenta {...ticketData} ref={ticketRef} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={handlePrintTicket}
            startIcon={<Printer size={20} />}
            sx={{ py: 1.5, px: 4, borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: '1rem' }}
          >
            Imprimir Ticket
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default MovimientosPage;
