import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Button, Grid,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Alert, LinearProgress, InputAdornment, Chip, Tab, Tabs,
  MenuItem, Tooltip, Select, FormControl, InputLabel
} from '@mui/material';
import {
  Truck, Plus, Search, Edit2, DollarSign, AlertCircle,
  CheckCircle, Clock, Building2, Phone, Mail, MapPin,
  CreditCard, FileText, Hash, TrendingDown, Receipt, Wallet
} from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/proveedores';

const formatMonto = (v) => Number(parseFloat(v || 0).toFixed(2)).toLocaleString('de-DE');

const estadoChip = (estado) => {
  const map = {
    pendiente: { label: 'Pendiente', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
    parcial:   { label: 'Parcial',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    pagado:    { label: 'Pagado',    color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  };
  const s = map[estado] || map.pendiente;
  return (
    <Box component="span" sx={{
      px: 1.5, py: 0.4, borderRadius: 99, fontSize: '0.75rem', fontWeight: 700,
      color: s.color, backgroundColor: s.bg, display: 'inline-block'
    }}>
      {s.label}
    </Box>
  );
};

// ─── MODALES ─────────────────────────────────────────────────────────────────

const ModalProveedor = ({ open, onClose, onSuccess, proveedorEdit }) => {
  const inicial = { nombre: '', contacto: '', telefono: '', correo: '', direccion: '', ruc_nit: '' };
  const [form, setForm] = useState(inicial);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (proveedorEdit) setForm({ ...inicial, ...proveedorEdit });
    else setForm(inicial);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proveedorEdit, open]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.nombre.trim()) return;
    setLoading(true);
    try {
      const method = proveedorEdit ? 'PUT' : 'POST';
      const url    = proveedorEdit ? `${API}/${proveedorEdit.id}` : API;
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) { onSuccess(); onClose(); }
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'nombre',    label: 'Nombre / Empresa *', icon: <Building2 size={16} />, required: true },
    { name: 'contacto',  label: 'Persona de Contacto', icon: <FileText size={16} /> },
    { name: 'telefono',  label: 'Teléfono',            icon: <Phone size={16} /> },
    { name: 'correo',    label: 'Correo',              icon: <Mail size={16} /> },
    { name: 'direccion', label: 'Dirección',           icon: <MapPin size={16} /> },
    { name: 'ruc_nit',   label: 'RUC / NIT',           icon: <Hash size={16} /> },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {proveedorEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '20px !important' }}>
        {fields.map(f => (
          <Box key={f.name}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8, color: 'text.secondary' }}>
              {f.icon}
              <Typography variant="body2" fontWeight={600}>{f.label}</Typography>
            </Box>
            <TextField
              name={f.name}
              value={form[f.name]}
              onChange={handleChange}
              fullWidth size="small"
              placeholder={f.label}
            />
          </Box>
        ))}
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none' }}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading || !form.nombre.trim()}
          sx={{ textTransform: 'none', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
          {loading ? 'Guardando…' : proveedorEdit ? 'Actualizar' : 'Guardar Proveedor'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ModalCompra = ({ open, onClose, onSuccess, proveedores }) => {
  const inicial = { proveedor_id: '', descripcion: '', monto: '', tipo_pago: 'credito', fecha_vencimiento: '', nota: '' };
  const [form, setForm] = useState(inicial);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (open) setForm(inicial); }, [open]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.proveedor_id || !form.descripcion || !form.monto) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/compras`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, monto: parseFloat(form.monto) })
      });
      if (res.ok) { onSuccess(); onClose(); }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Registrar Compra / Deuda</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '20px !important' }}>

        <Box>
          <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 0.8 }}>Proveedor *</Typography>
          <FormControl fullWidth size="small">
            <Select name="proveedor_id" value={form.proveedor_id} onChange={handleChange} displayEmpty>
              <MenuItem value="" disabled>Seleccionar proveedor</MenuItem>
              {proveedores.map(p => <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        <Box>
          <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 0.8 }}>Tipo de Pago</Typography>
          <FormControl fullWidth size="small">
            <Select name="tipo_pago" value={form.tipo_pago} onChange={handleChange}>
              <MenuItem value="credito">A Crédito (queda pendiente)</MenuItem>
              <MenuItem value="contado">Contado (ya pagado)</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8, color: 'text.secondary' }}>
            <FileText size={16} />
            <Typography variant="body2" fontWeight={600}>Descripción / Concepto *</Typography>
          </Box>
          <TextField name="descripcion" value={form.descripcion} onChange={handleChange}
            fullWidth size="small" placeholder="Ej. Compra de materiales eléctricos" multiline rows={2} />
        </Box>

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8, color: 'text.secondary' }}>
            <DollarSign size={16} />
            <Typography variant="body2" fontWeight={600}>Monto (Bs.) *</Typography>
          </Box>
          <TextField name="monto" value={form.monto} onChange={handleChange}
            fullWidth size="small" type="number" placeholder="0.00"
            slotProps={{ input: { startAdornment: <InputAdornment position="start">Bs.</InputAdornment> } }} />
        </Box>

        {form.tipo_pago === 'credito' && (
          <Box>
            <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 0.8 }}>Fecha de Vencimiento (opcional)</Typography>
            <TextField name="fecha_vencimiento" value={form.fecha_vencimiento} onChange={handleChange}
              fullWidth size="small" type="date"
              slotProps={{ inputLabel: { shrink: true } }} />
          </Box>
        )}

        <Box>
          <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 0.8 }}>Nota (opcional)</Typography>
          <TextField name="nota" value={form.nota} onChange={handleChange}
            fullWidth size="small" placeholder="Observaciones adicionales" />
        </Box>

      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none' }}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="warning"
          disabled={loading || !form.proveedor_id || !form.descripcion || !form.monto}
          sx={{ textTransform: 'none', boxShadow: '0 4px 14px rgba(245,158,11,0.35)' }}>
          {loading ? 'Guardando…' : 'Registrar Compra'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ModalPago = ({ open, onClose, onSuccess, compra }) => {
  const [form, setForm] = useState({ monto: '', metodo_pago: 'efectivo', nota: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && compra) setForm({ monto: compra.saldo_pendiente?.toFixed(2) || '', metodo_pago: 'efectivo', nota: '' });
  }, [open, compra]);

  const handleSubmit = async () => {
    if (!form.monto || parseFloat(form.monto) <= 0) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/compras/${compra.id}/pagar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, monto: parseFloat(form.monto) })
      });
      if (res.ok) { onSuccess(); onClose(); }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Registrar Pago al Proveedor</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '20px !important' }}>
        {compra && (
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <Typography variant="body2" color="text.secondary">{compra.proveedor}</Typography>
            <Typography variant="body2" fontWeight={600}>{compra.descripcion}</Typography>
            <Typography variant="h6" color="error.main" fontWeight={700}>Saldo: Bs. {formatMonto(compra.saldo_pendiente)}</Typography>
          </Box>
        )}
        <Box>
          <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 0.8 }}>Monto a Pagar (Bs.)</Typography>
          <TextField value={form.monto} onChange={e => setForm({ ...form, monto: e.target.value })}
            fullWidth size="small" type="number"
            slotProps={{ input: { startAdornment: <InputAdornment position="start">Bs.</InputAdornment> } }} />
        </Box>
        <Box>
          <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 0.8 }}>Método de Pago</Typography>
          <FormControl fullWidth size="small">
            <Select value={form.metodo_pago} onChange={e => setForm({ ...form, metodo_pago: e.target.value })}>
              <MenuItem value="efectivo">Efectivo</MenuItem>
              <MenuItem value="transferencia">Transferencia</MenuItem>
              <MenuItem value="cheque">Cheque</MenuItem>
              <MenuItem value="otro">Otro</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box>
          <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 0.8 }}>Nota (opcional)</Typography>
          <TextField value={form.nota} onChange={e => setForm({ ...form, nota: e.target.value })}
            fullWidth size="small" placeholder="Observación" />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none' }}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="success"
          disabled={loading || !form.monto || parseFloat(form.monto) <= 0}
          sx={{ textTransform: 'none' }}>
          {loading ? 'Procesando…' : 'Confirmar Pago'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

const ProveedoresPage = () => {
  const [tab, setTab] = useState(0);
  const [kpis, setKpis] = useState({ deuda_total: 0, compras_pendientes: 0, proveedores_activos: 0 });
  const [proveedores, setProveedores] = useState([]);
  const [compras, setCompras] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Modales
  const [modalProv, setModalProv] = useState(false);
  const [proveedorEdit, setProveedorEdit] = useState(null);
  const [modalCompra, setModalCompra] = useState(false);
  const [modalPago, setModalPago] = useState(false);
  const [compraSeleccionada, setCompraSeleccionada] = useState(null);

  const notify = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [rKpis, rProv, rCompras, rPagos] = await Promise.all([
        fetch(`${API}/kpis`).then(r => r.json()),
        fetch(API).then(r => r.json()),
        fetch(`${API}/compras`).then(r => r.json()),
        fetch(`${API}/pagos`).then(r => r.json()),
      ]);
      setKpis(rKpis);
      setProveedores(Array.isArray(rProv) ? rProv : []);
      setCompras(Array.isArray(rCompras) ? rCompras : []);
      setPagos(Array.isArray(rPagos) ? rPagos : []);
    } catch (e) {
      notify('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const onSuccessProv   = () => { notify('Proveedor guardado correctamente'); fetchAll(); };
  const onSuccessCompra = () => { notify('Compra registrada correctamente'); fetchAll(); };
  const onSuccessPago   = () => { notify('Pago registrado correctamente'); fetchAll(); };

  const comprasFiltradas = compras.filter(c =>
    c.proveedor?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const kpiCards = [
    {
      title: 'Deuda Total a Proveedores',
      value: `Bs. ${formatMonto(kpis.deuda_total)}`,
      icon: <TrendingDown size={22} />,
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, rgba(239,68,68,0.18) 0%, rgba(239,68,68,0.05) 100%)',
      border: '1px solid rgba(239,68,68,0.2)',
    },
    {
      title: 'Compras Pendientes',
      value: kpis.compras_pendientes,
      icon: <Clock size={22} />,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0.05) 100%)',
      border: '1px solid rgba(245,158,11,0.2)',
    },
    {
      title: 'Proveedores Activos',
      value: kpis.proveedores_activos,
      icon: <Truck size={22} />,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(16,185,129,0.05) 100%)',
      border: '1px solid rgba(16,185,129,0.2)',
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" color="text.primary" fontWeight={700}>Proveedores</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Gestiona proveedores, compras a crédito y pagos pendientes.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<Plus size={16} />}
            onClick={() => { setProveedorEdit(null); setModalProv(true); }}
            sx={{ textTransform: 'none', borderColor: 'divider', color: 'text.secondary' }}>
            Nuevo Proveedor
          </Button>
          <Button variant="contained" startIcon={<Receipt size={16} />}
            onClick={() => setModalCompra(true)}
            sx={{ textTransform: 'none', background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              boxShadow: '0 4px 14px rgba(245,158,11,0.4)' }}>
            Registrar Compra
          </Button>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ borderRadius: 1 }} />}

      {/* KPI Cards */}
      <Grid container spacing={2.5}>
        {kpiCards.map((k) => (
          <Grid size={{ xs: 12, sm: 4 }} key={k.title}>
            <Card sx={{ borderRadius: 3, background: k.gradient, border: k.border, position: 'relative', overflow: 'hidden' }}>
              <CardContent sx={{ p: '24px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${k.color}22`, color: k.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {k.icon}
                  </Box>
                </Box>
                <Typography variant="h4" color="text.primary" fontWeight={800} sx={{ mb: 0.5 }}>
                  {k.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>{k.title}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Card sx={{ borderRadius: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
            <Tab label="Compras a Crédito" icon={<CreditCard size={16} />} iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 600, minHeight: 56 }} />
            <Tab label="Proveedores" icon={<Truck size={16} />} iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 600, minHeight: 56 }} />
            <Tab label="Historial de Pagos" icon={<Wallet size={16} />} iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 600, minHeight: 56 }} />
          </Tabs>
        </Box>

        {/* TAB 0 — Compras */}
        {tab === 0 && (
          <>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', gap: 2 }}>
              <TextField
                placeholder="Buscar por proveedor o descripción..."
                size="small" value={busqueda} onChange={e => setBusqueda(e.target.value)}
                sx={{ flexGrow: 1 }}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={16} color="#9ca3af" /></InputAdornment> } }}
              />
            </Box>
            <TableContainer sx={{ maxHeight: 500 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {['Proveedor', 'Descripción', 'Monto Total', 'Pagado', 'Saldo Pendiente', 'Estado', 'Vencimiento', 'Acciones'].map(h => (
                      <TableCell key={h} sx={{ bgcolor: 'background.default', color: 'text.secondary', fontWeight: 700, fontSize: '0.8rem' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {comprasFiltradas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                        <Truck size={36} color="#6b7280" style={{ marginBottom: 8, opacity: 0.4 }} />
                        <Typography color="text.secondary">No hay compras registradas</Typography>
                      </TableCell>
                    </TableRow>
                  ) : comprasFiltradas.map(c => (
                    <TableRow hover key={c.id} sx={{ '& td': { borderBottom: 1, borderColor: 'divider' } }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="text.primary">{c.proveedor}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200 }}>{c.descripcion}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>Bs. {formatMonto(c.monto)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="success.main">Bs. {formatMonto(c.monto_pagado)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="error.main" fontWeight={700}>
                          Bs. {formatMonto(c.saldo_pendiente)}
                        </Typography>
                      </TableCell>
                      <TableCell>{estadoChip(c.estado_pago)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {c.fecha_vencimiento ? new Date(c.fecha_vencimiento).toLocaleDateString('es-BO') : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {c.estado_pago !== 'pagado' && (
                          <Tooltip title="Registrar pago">
                            <IconButton size="small" sx={{ color: '#10b981', '&:hover': { bgcolor: 'rgba(16,185,129,0.1)' } }}
                              onClick={() => { setCompraSeleccionada(c); setModalPago(true); }}>
                              <DollarSign size={18} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {/* TAB 1 — Proveedores */}
        {tab === 1 && (
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {['Proveedor / Empresa', 'Contacto', 'Teléfono', 'RUC/NIT', 'Deuda Actual', 'Estado', 'Acciones'].map(h => (
                    <TableCell key={h} sx={{ bgcolor: 'background.default', color: 'text.secondary', fontWeight: 700, fontSize: '0.8rem' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {proveedores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                      <Building2 size={36} color="#6b7280" style={{ marginBottom: 8, opacity: 0.4 }} />
                      <Typography color="text.secondary">No hay proveedores registrados</Typography>
                    </TableCell>
                  </TableRow>
                ) : proveedores.map(p => (
                  <TableRow hover key={p.id} sx={{ '& td': { borderBottom: 1, borderColor: 'divider' } }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="text.primary">{p.nombre}</Typography>
                      {p.correo && <Typography variant="caption" color="text.secondary">{p.correo}</Typography>}
                    </TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{p.contacto || '—'}</Typography></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{p.telefono || '—'}</Typography></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{p.ruc_nit || '—'}</Typography></TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}
                        color={p.deuda_pendiente > 0 ? 'error.main' : 'success.main'}>
                        Bs. {formatMonto(p.deuda_pendiente)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box component="span" sx={{
                        px: 1.5, py: 0.4, borderRadius: 99, fontSize: '0.75rem', fontWeight: 700,
                        color: p.activo ? '#10b981' : '#9ca3af',
                        bgcolor: p.activo ? 'rgba(16,185,129,0.1)' : 'rgba(156,163,175,0.1)',
                        display: 'inline-block'
                      }}>
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Editar">
                        <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                          onClick={() => { setProveedorEdit(p); setModalProv(true); }}>
                          <Edit2 size={16} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* TAB 2 — Historial de Pagos */}
        {tab === 2 && (
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {['Fecha', 'Proveedor', 'Concepto', 'Monto Pagado', 'Método', 'Nota'].map(h => (
                    <TableCell key={h} sx={{ bgcolor: 'background.default', color: 'text.secondary', fontWeight: 700, fontSize: '0.8rem' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {pagos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <Receipt size={36} color="#6b7280" style={{ marginBottom: 8, opacity: 0.4 }} />
                      <Typography color="text.secondary">No hay pagos registrados aún</Typography>
                    </TableCell>
                  </TableRow>
                ) : pagos.map(p => (
                  <TableRow hover key={p.id} sx={{ '& td': { borderBottom: 1, borderColor: 'divider' } }}>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(p.created_at).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </Typography>
                    </TableCell>
                    <TableCell><Typography variant="body2" fontWeight={600}>{p.proveedor}</Typography></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{p.compra_descripcion}</Typography></TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="success.main">Bs. {formatMonto(p.monto)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>{p.metodo_pago}</Typography>
                    </TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{p.nota || '—'}</Typography></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Modales */}
      <ModalProveedor open={modalProv} onClose={() => setModalProv(false)}
        onSuccess={onSuccessProv} proveedorEdit={proveedorEdit} />
      <ModalCompra open={modalCompra} onClose={() => setModalCompra(false)}
        onSuccess={onSuccessCompra} proveedores={proveedores} />
      <ModalPago open={modalPago} onClose={() => { setModalPago(false); setCompraSeleccionada(null); }}
        onSuccess={onSuccessPago} compra={compraSeleccionada} />

      <Snackbar open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity} sx={{ width: '100%', boxShadow: 3 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProveedoresPage;
