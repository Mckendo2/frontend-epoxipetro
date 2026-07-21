import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Button, Grid,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Alert, LinearProgress, InputAdornment, Chip, Tab, Tabs,
  MenuItem, Tooltip, Select, FormControl, Divider, Autocomplete,
  CircularProgress
} from '@mui/material';
import {
  Truck, Plus, Search, Edit2, DollarSign, AlertCircle,
  CheckCircle, Clock, Building2, Phone, Mail, MapPin,
  CreditCard, FileText, Hash, TrendingDown, Receipt, Wallet,
  ShoppingCart, Package, Barcode, Trash2, Tag
} from 'lucide-react';

const API_INV = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/inventario';
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

// ─── MODAL PROVEEDOR ─────────────────────────────────────────────────────────

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

// ─── MODAL ORDEN DE COMPRA ────────────────────────────────────────────────────

const itemVacio = () => ({
  _key: Math.random(),
  modo: 'buscar',          // 'buscar' | 'nuevo'
  presentacion_id: null,
  label: '',
  nombre: '',
  categoria_id: '',
  codigo_barras: '',
  precio_compra: '',
  precio_venta: '',
  cantidad: '',
});

const ModalOrdenCompra = ({ open, onClose, onSuccess, proveedores, catalogos }) => {
  const [form, setForm] = useState({
    proveedor_id: '',
    tipo_pago: 'credito',
    fecha_vencimiento: '',
    nota: '',
  });
  const [items, setItems]     = useState([itemVacio()]);
  const [loading, setLoading] = useState(false);
  const [busquedaMap, setBusquedaMap] = useState({}); // { _key: string }
  const [opcionesMap, setOpcionesMap] = useState({});  // { _key: [] }
  const [cargandoMap, setCargandoMap] = useState({});  // { _key: bool }
  const timerRef = useRef({});

  useEffect(() => {
    if (open) {
      setForm({ proveedor_id: '', tipo_pago: 'credito', fecha_vencimiento: '', nota: '' });
      setItems([itemVacio()]);
      setBusquedaMap({});
      setOpcionesMap({});
      setCargandoMap({});
    }
  }, [open]);

  // Buscar productos existentes con debounce
  const buscarProductos = (key, q) => {
    setBusquedaMap(p => ({ ...p, [key]: q }));
    clearTimeout(timerRef.current[key]);
    if (!q || q.length < 2) { setOpcionesMap(p => ({ ...p, [key]: [] })); return; }
    setCargandoMap(p => ({ ...p, [key]: true }));
    timerRef.current[key] = setTimeout(async () => {
      try {
        const res = await fetch(`${API_INV}/presentaciones/buscar?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setOpcionesMap(p => ({ ...p, [key]: Array.isArray(data) ? data : [] }));
      } finally {
        setCargandoMap(p => ({ ...p, [key]: false }));
      }
    }, 350);
  };

  const seleccionarProducto = (key, opcion) => {
    if (!opcion) return;
    setItems(prev => prev.map(it =>
      it._key === key
        ? { ...it, presentacion_id: opcion.id, label: opcion.label,
            precio_compra: opcion.precio_compra || '',
            precio_venta: opcion.precio_venta || '' }
        : it
    ));
  };

  const actualizarItem = (key, campo, valor) => {
    setItems(prev => prev.map(it => it._key === key ? { ...it, [campo]: valor } : it));
  };

  const agregarItem = () => setItems(prev => [...prev, itemVacio()]);
  const eliminarItem = (key) => setItems(prev => prev.filter(it => it._key !== key));

  const totalOrden = items.reduce((acc, it) => {
    const sub = parseFloat(it.precio_compra || 0) * parseFloat(it.cantidad || 0);
    return acc + (isNaN(sub) ? 0 : sub);
  }, 0);

  const handleSubmit = async () => {
    if (!form.proveedor_id) return;
    const itemsValidos = items.filter(it => {
      if (it.modo === 'buscar') return it.presentacion_id && parseFloat(it.cantidad) > 0;
      return it.nombre.trim() && parseFloat(it.cantidad) > 0;
    });
    if (itemsValidos.length === 0) return;

    setLoading(true);
    try {
      const payload = {
        ...form,
        items: itemsValidos.map(it => ({
          presentacion_id: it.modo === 'buscar' ? it.presentacion_id : null,
          nombre: it.nombre,
          categoria_id: it.categoria_id || null,
          codigo_barras: it.codigo_barras || null,
          precio_compra: parseFloat(it.precio_compra) || 0,
          precio_venta: parseFloat(it.precio_venta) || 0,
          cantidad: parseFloat(it.cantidad),
        }))
      };
      const res = await fetch(`${API}/compras`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) { onSuccess(); onClose(); }
      else {
        const err = await res.json();
        alert(err.mensaje || 'Error al registrar la orden');
      }
    } finally {
      setLoading(false);
    }
  };

  const puedeContinuar = form.proveedor_id &&
    items.some(it => {
      if (it.modo === 'buscar') return it.presentacion_id && parseFloat(it.cantidad) > 0;
      return it.nombre.trim() && parseFloat(it.cantidad) > 0;
    });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 800, fontSize: '1.2rem', pb: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
            <ShoppingCart size={22} />
          </Box>
          Nueva Orden de Compra
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: '20px !important' }}>
        {/* Cabecera de la orden */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
            <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ mb: 0.8 }}>
              Proveedor *
            </Typography>
            <FormControl fullWidth size="small">
              <Select value={form.proveedor_id}
                onChange={e => setForm(f => ({ ...f, proveedor_id: e.target.value }))} displayEmpty>
                <MenuItem value="" disabled>Seleccionar proveedor</MenuItem>
                {proveedores.map(p => <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: '1 1 160px', minWidth: 160 }}>
            <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ mb: 0.8 }}>
              Tipo de Pago
            </Typography>
            <FormControl fullWidth size="small">
              <Select value={form.tipo_pago}
                onChange={e => setForm(f => ({ ...f, tipo_pago: e.target.value }))}>
                <MenuItem value="credito">A Crédito</MenuItem>
                <MenuItem value="contado">Contado</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {form.tipo_pago === 'credito' && (
            <Box sx={{ flex: '1 1 160px', minWidth: 160 }}>
              <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ mb: 0.8 }}>
                Fecha Vencimiento
              </Typography>
              <TextField fullWidth size="small" type="date"
                value={form.fecha_vencimiento}
                onChange={e => setForm(f => ({ ...f, fecha_vencimiento: e.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }} />
            </Box>
          )}
          <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
            <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ mb: 0.8 }}>
              Nota (opcional)
            </Typography>
            <TextField fullWidth size="small" placeholder="Observación..."
              value={form.nota} onChange={e => setForm(f => ({ ...f, nota: e.target.value }))} />
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Tabla de ítems */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="body1" fontWeight={700} color="text.primary">
            Ítems de la compra
          </Typography>
          <Button size="small" startIcon={<Plus size={14} />}
            onClick={agregarItem}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
            Agregar ítem
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.map((item, idx) => (
            <Box key={item._key} sx={{
              p: 2, borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              position: 'relative'
            }}>
              {/* Número del ítem */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Chip label={`Ítem ${idx + 1}`} size="small"
                  sx={{ fontWeight: 700, bgcolor: 'rgba(99,102,241,0.1)', color: '#6366f1' }} />
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  {/* Toggle: Buscar existente / Nuevo producto */}
                  <Button size="small" variant={item.modo === 'buscar' ? 'contained' : 'outlined'}
                    onClick={() => actualizarItem(item._key, 'modo', 'buscar')}
                    sx={{ textTransform: 'none', fontSize: '0.72rem', py: 0.3, px: 1, borderRadius: 2, minWidth: 0 }}>
                    Existente
                  </Button>
                  <Button size="small" variant={item.modo === 'nuevo' ? 'contained' : 'outlined'}
                    color="warning"
                    onClick={() => actualizarItem(item._key, 'modo', 'nuevo')}
                    sx={{ textTransform: 'none', fontSize: '0.72rem', py: 0.3, px: 1, borderRadius: 2, minWidth: 0 }}>
                    Nuevo
                  </Button>
                  {items.length > 1 && (
                    <Tooltip title="Eliminar ítem">
                      <IconButton size="small" color="error" onClick={() => eliminarItem(item._key)}>
                        <Trash2 size={16} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {/* Modo: Buscar producto existente */}
                {item.modo === 'buscar' ? (
                  <Box sx={{ flex: '2 1 280px', minWidth: 240 }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Buscar producto *
                    </Typography>
                    <Autocomplete
                      size="small"
                      freeSolo
                      options={opcionesMap[item._key] || []}
                      getOptionLabel={(o) => (typeof o === 'string' ? o : o.label)}
                      loading={cargandoMap[item._key]}
                      inputValue={busquedaMap[item._key] || item.label || ''}
                      onInputChange={(_, val) => buscarProductos(item._key, val)}
                      onChange={(_, val) => {
                        if (val && typeof val === 'object') seleccionarProducto(item._key, val);
                      }}
                      renderInput={(params) => (
                        <TextField {...params}
                          placeholder="Escribe para buscar..."
                          slotProps={{
                            input: {
                              ...params.InputProps,
                              startAdornment: <><Search size={14} color="#9ca3af" style={{ marginRight: 4 }} />{params.InputProps.startAdornment}</>,
                              endAdornment: (
                                <>
                                  {cargandoMap[item._key] ? <CircularProgress size={14} /> : null}
                                  {params.InputProps.endAdornment}
                                </>
                              )
                            }
                          }}
                        />
                      )}
                    />
                  </Box>
                ) : (
                  /* Modo: Nuevo producto */
                  <>
                    <Box sx={{ flex: '2 1 200px', minWidth: 180 }}>
                      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Nombre del producto *
                      </Typography>
                      <TextField fullWidth size="small" placeholder="Ej. Chapa Yale 370"
                        value={item.nombre}
                        onChange={e => actualizarItem(item._key, 'nombre', e.target.value)}
                        slotProps={{ input: { startAdornment: <Package size={14} color="#9ca3af" style={{ marginRight: 4 }} /> } }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 140px', minWidth: 120 }}>
                      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Categoría
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select value={item.categoria_id}
                          onChange={e => actualizarItem(item._key, 'categoria_id', e.target.value)}
                          displayEmpty>
                          <MenuItem value=""><em>Sin categoría</em></MenuItem>
                          {(catalogos?.categorias || []).map(c =>
                            <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
                          )}
                        </Select>
                      </FormControl>
                    </Box>
                    <Box sx={{ flex: '1 1 140px', minWidth: 120 }}>
                      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Código de Barra
                      </Typography>
                      <TextField fullWidth size="small" placeholder="Opcional"
                        value={item.codigo_barras}
                        onChange={e => actualizarItem(item._key, 'codigo_barras', e.target.value)}
                        slotProps={{ input: { startAdornment: <Barcode size={14} color="#9ca3af" style={{ marginRight: 4 }} /> } }}
                      />
                    </Box>
                  </>
                )}

                {/* Campos comunes */}
                <Box sx={{ flex: '1 1 100px', minWidth: 90 }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Cantidad *
                  </Typography>
                  <TextField fullWidth size="small" type="number" placeholder="0"
                    value={item.cantidad}
                    onChange={e => actualizarItem(item._key, 'cantidad', e.target.value)}
                  />
                </Box>
                <Box sx={{ flex: '1 1 110px', minWidth: 100 }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    P. Compra (Bs.)
                  </Typography>
                  <TextField fullWidth size="small" type="number" placeholder="0.00"
                    value={item.precio_compra}
                    onChange={e => actualizarItem(item._key, 'precio_compra', e.target.value)}
                    slotProps={{ input: { startAdornment: <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>Bs.</Typography> } }}
                  />
                </Box>
                <Box sx={{ flex: '1 1 110px', minWidth: 100 }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    P. Venta (Bs.)
                  </Typography>
                  <TextField fullWidth size="small" type="number" placeholder="0.00"
                    value={item.precio_venta}
                    onChange={e => actualizarItem(item._key, 'precio_venta', e.target.value)}
                    slotProps={{ input: { startAdornment: <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>Bs.</Typography> } }}
                  />
                </Box>

                {/* Subtotal */}
                {item.precio_compra && item.cantidad ? (
                  <Box sx={{ flex: '0 0 auto', alignSelf: 'flex-end', pb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">Subtotal</Typography>
                    <Typography variant="body2" fontWeight={700} color="warning.main">
                      Bs. {formatMonto(parseFloat(item.precio_compra || 0) * parseFloat(item.cantidad || 0))}
                    </Typography>
                  </Box>
                ) : null}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Total */}
        <Box sx={{
          mt: 2.5, p: 2, borderRadius: 2,
          background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(239,68,68,0.06) 100%)',
          border: '1px solid rgba(245,158,11,0.25)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Receipt size={18} color="#f59e0b" />
            <Typography variant="body2" fontWeight={700}>Total de la orden</Typography>
          </Box>
          <Typography variant="h5" fontWeight={800} color="warning.main">
            Bs. {formatMonto(totalOrden)}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none' }}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading || !puedeContinuar}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <CheckCircle size={16} />}
          sx={{
            textTransform: 'none', fontWeight: 700, px: 3,
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            boxShadow: '0 4px 14px rgba(245,158,11,0.4)',
            '&:hover': { background: 'linear-gradient(135deg, #d97706, #dc2626)' }
          }}>
          {loading ? 'Registrando…' : 'Registrar Orden de Compra'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── MODAL PAGO ───────────────────────────────────────────────────────────────

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
  const [catalogos, setCatalogos] = useState({ categorias: [], marcas: [], unidades: [] });
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Modales
  const [modalProv, setModalProv] = useState(false);
  const [proveedorEdit, setProveedorEdit] = useState(null);
  const [modalOrden, setModalOrden] = useState(false);
  const [modalPago, setModalPago] = useState(false);
  const [compraSeleccionada, setCompraSeleccionada] = useState(null);

  const notify = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [rKpis, rProv, rCompras, rPagos, rCat] = await Promise.all([
        fetch(`${API}/kpis`).then(r => r.json()),
        fetch(API).then(r => r.json()),
        fetch(`${API}/compras`).then(r => r.json()),
        fetch(`${API}/pagos`).then(r => r.json()),
        fetch(`${API_INV}/catalogos`).then(r => r.json()),
      ]);
      setKpis(rKpis);
      setProveedores(Array.isArray(rProv) ? rProv : []);
      setCompras(Array.isArray(rCompras) ? rCompras : []);
      setPagos(Array.isArray(rPagos) ? rPagos : []);
      setCatalogos(rCat || { categorias: [], marcas: [], unidades: [] });
    } catch (e) {
      notify('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const onSuccessProv   = () => { notify('Proveedor guardado correctamente'); fetchAll(); };
  const onSuccessOrden  = () => { notify('Orden de compra registrada — el stock fue actualizado en el almacén'); fetchAll(); };
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
            Registra órdenes de compra — los productos entran directo al almacén.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<Plus size={16} />}
            onClick={() => { setProveedorEdit(null); setModalProv(true); }}
            sx={{ textTransform: 'none', borderColor: 'divider', color: 'text.secondary' }}>
            Nuevo Proveedor
          </Button>
          <Button variant="contained" startIcon={<ShoppingCart size={16} />}
            onClick={() => setModalOrden(true)}
            sx={{
              textTransform: 'none', fontWeight: 700,
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              boxShadow: '0 4px 14px rgba(245,158,11,0.4)',
              '&:hover': { background: 'linear-gradient(135deg, #d97706, #dc2626)' }
            }}>
            Nueva Orden de Compra
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
            <Tab label="Órdenes de Compra" icon={<CreditCard size={16} />} iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 600, minHeight: 56 }} />
            <Tab label="Proveedores" icon={<Truck size={16} />} iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 600, minHeight: 56 }} />
            <Tab label="Historial de Pagos" icon={<Wallet size={16} />} iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 600, minHeight: 56 }} />
          </Tabs>
        </Box>

        {/* TAB 0 — Órdenes de Compra */}
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
                        <ShoppingCart size={36} color="#6b7280" style={{ marginBottom: 8, opacity: 0.4 }} />
                        <Typography color="text.secondary">No hay órdenes de compra registradas</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Usa el botón "Nueva Orden de Compra" para ingresar mercadería al almacén
                        </Typography>
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
      <ModalOrdenCompra open={modalOrden} onClose={() => setModalOrden(false)}
        onSuccess={onSuccessOrden} proveedores={proveedores} catalogos={catalogos} />
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
