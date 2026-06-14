import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Button, Grid, TextField, MenuItem, Select,
  FormControl, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Alert, LinearProgress, Collapse, Tooltip, Divider, Tabs, Tab
} from '@mui/material';
import {
  Package, Plus, Search, ChevronDown, ChevronRight, Tag, AlertTriangle,
  Warehouse, Store, TrendingUp, Edit2, Barcode, ArrowRightLeft, Download, Upload, XCircle
} from 'lucide-react';

const formatMonto = (monto) => Number(parseFloat(monto || 0).toFixed(2)).toLocaleString('de-DE');

const API = 'http://localhost:3000/api/inventario';

const InventarioPage = () => {
  const [productos, setProductos] = useState([]);
  const [catalogos, setCatalogos] = useState({ categorias: [], marcas: [], unidades: [] });
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const fileInputRef = React.useRef();

  // Modals
  const [modalProducto, setModalProducto] = useState(false);
  const [modalPresentacion, setModalPresentacion] = useState(false);
  const [modalEntrada, setModalEntrada] = useState(false);
  const [modalTraslado, setModalTraslado] = useState(false);
  const [modalEditarPresentacion, setModalEditarPresentacion] = useState(false);
  const [selectedPresentacion, setSelectedPresentacion] = useState(null);

  const [formProducto, setFormProducto] = useState({ id: '', nombre: '', descripcion: '', categoria_id: '', marca_id: '', imagen: null, imagen_url: '' });
  const [preview, setPreview] = useState(null);
  const [formPresentacion, setFormPresentacion] = useState({ producto_id: '', nombre: '', codigo_barras: '', sku: '', unidad_medida_id: '', cantidad_unidad: 1, precio_compra: '', precio_venta: '' });
  const [formEditarPresentacion, setFormEditarPresentacion] = useState({ id: '', nombre: '', codigo_barras: '', sku: '', unidad_medida_id: '', precio_compra: '', precio_venta: '' });
  const [formMovimiento, setFormMovimiento] = useState({ cantidad: '', nota: '' });
  const [visorImagen, setVisorImagen] = useState({ open: false, src: '', title: '' });

  const notify = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch(`${API}/productos`),
        fetch(`${API}/catalogos`)
      ]);
      setProductos(await prodRes.json());
      setCatalogos(await catRes.json());
    } catch {
      notify('Error al cargar datos del servidor', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleRow = (id) => setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));

  const handleGuardarProducto = async () => {
    if (!formProducto.nombre) return notify('El nombre es obligatorio', 'warning');
    try {
      const formData = new FormData();
      formData.append('nombre', formProducto.nombre);
      formData.append('descripcion', formProducto.descripcion || '');
      if (formProducto.categoria_id) formData.append('categoria_id', formProducto.categoria_id);
      if (formProducto.marca_id) formData.append('marca_id', formProducto.marca_id);
      if (formProducto.imagen) formData.append('imagen', formProducto.imagen);

      const isEditing = !!formProducto.id;
      const url = isEditing ? `${API}/productos/${formProducto.id}` : `${API}/productos`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, { 
        method, 
        body: formData 
      });
      if (res.ok) { 
        notify(`Producto ${isEditing ? 'actualizado' : 'creado'}`); 
        setModalProducto(false); 
        setFormProducto({ id: '', nombre: '', descripcion: '', categoria_id: '', marca_id: '', imagen: null, imagen_url: '' }); 
        setPreview(null);
        fetchData(); 
      }
      else { const err = await res.json(); notify(err.mensaje, 'error'); }
    } catch { notify('Error de conexión', 'error'); }
  };

  const handleOpenEditarProducto = (producto) => {
    setFormProducto({
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      categoria_id: producto.categoria_id || '',
      marca_id: producto.marca_id || '',
      imagen: null,
      imagen_url: producto.imagen_url || ''
    });
    setPreview(producto.imagen_url ? `http://localhost:3000${producto.imagen_url}` : null);
    setModalProducto(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormProducto({ ...formProducto, imagen: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleGuardarPresentacion = async () => {
    if (!formPresentacion.producto_id || !formPresentacion.nombre || !formPresentacion.precio_venta) return notify('Producto, nombre y precio de venta son obligatorios', 'warning');
    try {
      const res = await fetch(`${API}/presentaciones`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formPresentacion) });
      if (res.ok) { notify('Presentación creada'); setModalPresentacion(false); setFormPresentacion({ producto_id: '', nombre: '', codigo_barras: '', sku: '', unidad_medida_id: '', cantidad_unidad: 1, precio_compra: '', precio_venta: '' }); fetchData(); }
      else { const err = await res.json(); notify(err.mensaje, 'error'); }
    } catch { notify('Error de conexión', 'error'); }
  };

  const handleActualizarPresentacion = async () => {
    if (!formEditarPresentacion.nombre || !formEditarPresentacion.precio_venta) return notify('Nombre y precio de venta son obligatorios', 'warning');
    try {
      const res = await fetch(`${API}/presentaciones/${formEditarPresentacion.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formEditarPresentacion) });
      if (res.ok) { notify('Presentación actualizada'); setModalEditarPresentacion(false); fetchData(); }
      else { const err = await res.json(); notify(err.mensaje, 'error'); }
    } catch { notify('Error de conexión', 'error'); }
  };

  const handleEntrada = async () => {
    if (!formMovimiento.cantidad || formMovimiento.cantidad <= 0) return notify('Ingresa una cantidad válida', 'warning');
    try {
      const res = await fetch(`${API}/movimientos/entrada-almacen`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ presentacion_id: selectedPresentacion.id, ...formMovimiento }) });
      if (res.ok) { notify(`✓ Entrada registrada en Almacén`); setModalEntrada(false); setFormMovimiento({ cantidad: '', nota: '' }); fetchData(); }
      else { const err = await res.json(); notify(err.mensaje, 'error'); }
    } catch { notify('Error de conexión', 'error'); }
  };

  const handleTraslado = async () => {
    if (!formMovimiento.cantidad || formMovimiento.cantidad <= 0) return notify('Ingresa una cantidad válida', 'warning');
    try {
      const res = await fetch(`${API}/movimientos/traslado-tienda`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ presentacion_id: selectedPresentacion.id, ...formMovimiento }) });
      if (res.ok) { notify(`✓ Traslado a Tienda registrado`); setModalTraslado(false); setFormMovimiento({ cantidad: '', nota: '' }); fetchData(); }
      else { const err = await res.json(); notify(err.mensaje, 'error'); }
    } catch { notify('Error de conexión', 'error'); }
  };

  const productosFiltrados = productos.filter(p => {
    const coincideCategoria = filtroCategoria === '' || p.categoria === filtroCategoria;
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.categoria?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.presentaciones?.some(pr => pr.codigo_barras?.includes(busqueda) || pr.sku?.includes(busqueda));
    return coincideCategoria && coincideBusqueda;
  });

  const handleExportarPlantilla = async () => {
    try {
      const res = await fetch(`${API}/exportar-plantilla`);
      if (!res.ok) throw new Error('Error al descargar');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Plantilla_Inventario_${new Date().toLocaleDateString('es-BO').replace(/\//g, '-')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      notify('Error al exportar plantilla', 'error');
    }
  };

  const handleImportarExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const res = await fetch(`${API}/importar-excel`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        notify(data.mensaje, 'success');
        fetchData();
      } else {
        notify(data.mensaje, 'error');
      }
    } catch {
      notify('Error al importar archivo', 'error');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const totalProductos = productos.length;
  const totalPresentaciones = productos.reduce((acc, p) => acc + p.presentaciones.length, 0);
  const stockBajo = productos.reduce((acc, p) => acc + p.presentaciones.filter(pr => pr.stock_tienda <= (pr.stock_minimo || 0)).length, 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" color="text.primary">Almacén</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Gestión de productos, presentaciones y movimientos de stock.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {/* Botón secundario: Exportar Excel */}
          <input 
            type="file" 
            accept=".xlsx" 
            style={{ display: 'none' }} 
            ref={fileInputRef} 
            onChange={handleImportarExcel} 
          />
          <Button
            variant="outlined"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            startIcon={<Upload size={16} />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderColor: '#6b7280',
              color: '#4b5563',
              borderRadius: '10px',
              px: 2,
              '&:hover': { backgroundColor: 'rgba(107,114,128,0.08)', borderColor: '#4b5563' }
            }}
          >
            Importar Excel
          </Button>
          
          <Button
            variant="outlined"
            onClick={handleExportarPlantilla}
            startIcon={<Download size={16} />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderColor: '#6b7280',
              color: '#4b5563',
              borderRadius: '10px',
              px: 2,
              '&:hover': { backgroundColor: 'rgba(107,114,128,0.08)', borderColor: '#4b5563' }
            }}
          >
            Exportar Plantilla
          </Button>

          {/* Botón secundario: Nueva Presentación — estilo teal/verde, outline */}
          <Button
            variant="outlined"
            onClick={() => setModalPresentacion(true)}
            startIcon={<Tag size={16} />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderColor: '#10b981',
              color: '#10b981',
              borderRadius: '10px',
              px: 2,
              '&:hover': {
                backgroundColor: 'rgba(16,185,129,0.08)',
                borderColor: '#10b981',
              }
            }}
          >
            Nueva Presentación
          </Button>

          {/* Botón principal: Nuevo Producto — sólido morado con sombra */}
          <Button
            variant="contained"
            onClick={() => {
              setFormProducto({ id: '', nombre: '', descripcion: '', categoria_id: '', marca_id: '', imagen: null, imagen_url: '' });
              setPreview(null);
              setModalProducto(true);
            }}
            startIcon={<Package size={16} />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '10px',
              px: 2,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 4px 14px 0 rgba(99,102,241,0.45)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                boxShadow: '0 6px 20px 0 rgba(99,102,241,0.55)',
              }
            }}
          >
            Nuevo Producto
          </Button>
        </Box>
      </Box>

      {/* KPIs */}
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: '20px !important' }}>
              <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>
                <Package size={24} />
              </Box>
              <Box>
                <Typography color="text.secondary" variant="body2" fontWeight={600}>Total Productos</Typography>
                <Typography variant="h4" color="text.primary">{totalProductos}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} md={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: '20px !important' }}>
              <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                <Store size={24} />
              </Box>
              <Box>
                <Typography color="text.secondary" variant="body2" fontWeight={600}>Presentaciones</Typography>
                <Typography variant="h4" color="text.primary">{totalPresentaciones}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} md={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: '20px !important' }}>
              <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: stockBajo > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: stockBajo > 0 ? '#ef4444' : '#f59e0b' }}>
                <AlertTriangle size={24} />
              </Box>
              <Box>
                <Typography color="text.secondary" variant="body2" fontWeight={600}>Stock Bajo en Tienda</Typography>
                <Typography variant="h4" color={stockBajo > 0 ? 'error.main' : 'text.primary'}>{stockBajo}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla */}
      {loading && <LinearProgress sx={{ borderRadius: 1 }} />}
      <Card sx={{ overflow: 'hidden' }}>
        <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', borderBottom: 1, borderColor: 'divider', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar por nombre, categoría, código..."
            size="small"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            sx={{ flexGrow: 1, minWidth: '200px' }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={18} color="#9ca3af" /></InputAdornment> } }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={filtroCategoria}
              onChange={e => setFiltroCategoria(e.target.value)}
              displayEmpty
              sx={{ borderRadius: 1.5 }}
            >
              <MenuItem value=""><em>Todas las categorías</em></MenuItem>
              {catalogos.categorias.map(c => (
                <MenuItem key={c.id} value={c.nombre}>{c.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Tabla de productos expandible */}
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: 'background.default', color: 'text.secondary', fontWeight: 600, borderColor: 'divider', width: 40 }} />
                <TableCell sx={{ backgroundColor: 'background.default', color: 'text.secondary', fontWeight: 600, borderColor: 'divider' }}>Producto</TableCell>
                <TableCell sx={{ backgroundColor: 'background.default', color: 'text.secondary', fontWeight: 600, borderColor: 'divider' }}>Categoría</TableCell>
                <TableCell sx={{ backgroundColor: 'background.default', color: 'text.secondary', fontWeight: 600, borderColor: 'divider' }}>Marca</TableCell>
                <TableCell sx={{ backgroundColor: 'background.default', color: 'text.secondary', fontWeight: 600, borderColor: 'divider' }}>Presentaciones</TableCell>
                <TableCell sx={{ backgroundColor: 'background.default', color: 'text.secondary', fontWeight: 600, borderColor: 'divider', width: 60 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {productosFiltrados.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No se encontraron productos</Typography>
                  </TableCell>
                </TableRow>
              ) : productosFiltrados.map(producto => (
                <React.Fragment key={producto.id}>
                  <TableRow
                    hover
                    onClick={() => toggleRow(producto.id)}
                    sx={{ cursor: 'pointer', '& td': { borderColor: 'divider' } }}
                  >
                    <TableCell>
                      <IconButton size="small" sx={{ color: 'text.secondary' }}>
                        {expandedRows[producto.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box 
                          onClick={(e) => {
                            if(producto.imagen_url) {
                              e.stopPropagation();
                              setVisorImagen({ open: true, src: `http://localhost:3000${producto.imagen_url}`, title: producto.nombre });
                            }
                          }}
                          sx={{ 
                            width: 40, height: 40, borderRadius: 2, overflow: 'hidden', display: 'flex', 
                            alignItems: 'center', justifyContent: 'center', 
                            bgcolor: producto.imagen_url ? 'transparent' : 'rgba(99,102,241,0.08)',
                            cursor: producto.imagen_url ? 'zoom-in' : 'default',
                            transition: 'all 0.2s',
                            '&:hover': producto.imagen_url ? { transform: 'scale(1.05)', boxShadow: 1 } : {}
                          }}
                        >
                          {producto.imagen_url ? (
                            <img src={`http://localhost:3000${producto.imagen_url}`} alt={producto.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Package size={20} color="#6366f1" />
                          )}
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={600} color="text.primary">{producto.nombre}</Typography>
                          {producto.descripcion && <Typography variant="caption" color="text.secondary">{producto.descripcion.substring(0, 60)}...</Typography>}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={producto.categoria || 'Sin categoría'} size="small" sx={{ backgroundColor: 'rgba(99,102,241,0.1)', color: '#6366f1', fontWeight: 600, borderRadius: 1.5 }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{producto.marca || '-'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={`${producto.presentaciones.length} presentación(es)`} size="small" sx={{ backgroundColor: 'action.hover', color: 'text.secondary', borderRadius: 1.5 }} />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <Tooltip title="Editar Producto">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenEditarProducto(producto); }} sx={{ color: 'text.secondary' }}>
                          <Edit2 size={16} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>

                  {/* Fila expandida de presentaciones */}
                  <TableRow>
                    <TableCell colSpan={6} sx={{ p: 0, borderColor: 'divider', backgroundColor: 'action.hover' }}>
                      <Collapse in={expandedRows[producto.id]} timeout="auto" unmountOnExit>
                        <Box sx={{ px: 4, py: 2 }}>
                          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>
                            Presentaciones
                          </Typography>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600, borderColor: 'divider', fontSize: '0.75rem' }}>Presentación</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600, borderColor: 'divider', fontSize: '0.75rem' }}>Código</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600, borderColor: 'divider', fontSize: '0.75rem' }}>P. Compra</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600, borderColor: 'divider', fontSize: '0.75rem' }}>P. Venta</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600, borderColor: 'divider', fontSize: '0.75rem' }}>Margen</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600, borderColor: 'divider', fontSize: '0.75rem' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Store size={14} /> Tienda</Box>
                                </TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600, borderColor: 'divider', fontSize: '0.75rem' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Warehouse size={14} /> Almacén</Box>
                                </TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600, borderColor: 'divider', fontSize: '0.75rem', textAlign: 'right' }}>Acciones</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {producto.presentaciones.map(pr => {
                                const stockBajoAlerta = pr.stock_tienda <= pr.stock_minimo && pr.stock_minimo > 0;
                                return (
                                  <TableRow key={pr.id} sx={{ '& td': { borderColor: 'divider' } }}>
                                    <TableCell>
                                      <Typography variant="body2" fontWeight={500} color="text.primary">{pr.nombre}</Typography>
                                      <Typography variant="caption" color="text.secondary">{pr.unidad}</Typography>
                                    </TableCell>
                                    <TableCell>
                                      {pr.codigo_barras ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                          <Barcode size={14} color="#9ca3af" />
                                          <Typography variant="caption" color="text.secondary">{pr.codigo_barras}</Typography>
                                        </Box>
                                      ) : <Typography variant="caption" color="text.disabled">-</Typography>}
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2" color="text.secondary">Bs. {formatMonto(pr.precio_compra)}</Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2" fontWeight={600} color="text.primary">Bs. {formatMonto(pr.precio_venta)}</Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={`${pr.margen_ganancia}%`}
                                        size="small"
                                        icon={<TrendingUp size={12} />}
                                        sx={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 600, borderRadius: 1.5 }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        {stockBajoAlerta && <AlertTriangle size={14} color="#ef4444" />}
                                        <Typography variant="body2" fontWeight={600} color={stockBajoAlerta ? 'error.main' : 'text.primary'}>
                                          {pr.stock_tienda} {pr.unidad}
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2" color="text.secondary">{pr.stock_almacen} {pr.unidad}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'right' }}>
                                      <Tooltip title="Entrada a Almacén">
                                        <IconButton size="small" sx={{ color: '#10b981' }} onClick={(e) => { e.stopPropagation(); setSelectedPresentacion(pr); setModalEntrada(true); }}>
                                          <Warehouse size={16} />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Trasladar a Tienda">
                                        <IconButton size="small" sx={{ color: '#6366f1' }} onClick={(e) => { e.stopPropagation(); setSelectedPresentacion(pr); setModalTraslado(true); }}>
                                          <ArrowRightLeft size={16} />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Editar">
                                        <IconButton size="small" sx={{ color: 'text.secondary' }} onClick={(e) => { 
                                          e.stopPropagation(); 
                                          setFormEditarPresentacion({
                                            id: pr.id,
                                            nombre: pr.nombre,
                                            codigo_barras: pr.codigo_barras || '',
                                            sku: pr.sku || '',
                                            unidad_medida_id: catalogos.unidades.find(u => u.abreviatura === pr.unidad)?.id || '',
                                            precio_compra: pr.precio_compra,
                                            precio_venta: pr.precio_venta
                                          });
                                          setModalEditarPresentacion(true); 
                                        }}>
                                          <Edit2 size={16} />
                                        </IconButton>
                                      </Tooltip>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ---- MODALES ---- */}

      {/* Modal Nuevo Producto */}
      <Dialog open={modalProducto} onClose={() => setModalProducto(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Producto</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '24px !important' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'text.secondary' }}>
              <Package size={18} /><Typography variant="body2" fontWeight={600}>Nombre del Producto</Typography>
            </Box>
            <TextField placeholder="Ej. Chapa Yale 3 Golpes" name="nombre" value={formProducto.nombre} onChange={e => setFormProducto({ ...formProducto, nombre: e.target.value })} fullWidth size="small" />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'text.secondary' }}>
              <Typography variant="body2" fontWeight={600}>Descripción (Opcional)</Typography>
            </Box>
            <TextField placeholder="Descripción técnica del producto" name="descripcion" value={formProducto.descripcion} onChange={e => setFormProducto({ ...formProducto, descripcion: e.target.value })} fullWidth size="small" multiline rows={2} />
          </Box>
          <Box>
            <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>Imagen (Opcional)</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button variant="outlined" component="label" size="small" sx={{ textTransform: 'none' }}>
                Subir Imagen
                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
              </Button>
              {preview && (
                <img src={preview} alt="Vista previa" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>Categoría</Typography>
              <FormControl fullWidth size="small">
                <Select value={formProducto.categoria_id} onChange={e => setFormProducto({ ...formProducto, categoria_id: e.target.value })} displayEmpty>
                  <MenuItem value=""><em>Sin categoría</em></MenuItem>
                  {catalogos.categorias.map(c => <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>Marca</Typography>
              <FormControl fullWidth size="small">
                <Select value={formProducto.marca_id} onChange={e => setFormProducto({ ...formProducto, marca_id: e.target.value })} displayEmpty>
                  <MenuItem value=""><em>Sin marca</em></MenuItem>
                  {catalogos.marcas.map(m => <MenuItem key={m.id} value={m.id}>{m.nombre}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalProducto(false)} color="inherit" sx={{ textTransform: 'none' }}>Cancelar</Button>
          <Button onClick={handleGuardarProducto} variant="contained" sx={{ textTransform: 'none' }}>Guardar Producto</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Nueva Presentación */}
      <Dialog open={modalPresentacion} onClose={() => setModalPresentacion(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Presentación</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '24px !important' }}>
          <Box>
            <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>Producto</Typography>
            <FormControl fullWidth size="small">
              <Select value={formPresentacion.producto_id} onChange={e => setFormPresentacion({ ...formPresentacion, producto_id: e.target.value })} displayEmpty>
                <MenuItem value=""><em>Selecciona un producto</em></MenuItem>
                {productos.map(p => <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>Nombre de la Presentación</Typography>
              <TextField placeholder="Ej. 1 kg / KIT 20 kg" value={formPresentacion.nombre} onChange={e => setFormPresentacion({ ...formPresentacion, nombre: e.target.value })} fullWidth size="small" />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>Unidad de Medida</Typography>
              <FormControl fullWidth size="small">
                <Select value={formPresentacion.unidad_medida_id} onChange={e => setFormPresentacion({ ...formPresentacion, unidad_medida_id: e.target.value })} displayEmpty>
                  <MenuItem value=""><em>Selecciona</em></MenuItem>
                  {catalogos.unidades.map(u => <MenuItem key={u.id} value={u.id}>{u.nombre}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>Código de Barras / QR</Typography>
              <TextField placeholder="Escanea o escribe" value={formPresentacion.codigo_barras} onChange={e => setFormPresentacion({ ...formPresentacion, codigo_barras: e.target.value })} fullWidth size="small" slotProps={{ input: { startAdornment: <InputAdornment position="start"><Barcode size={16} color="#9ca3af" /></InputAdornment> } }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>SKU Interno</Typography>
              <TextField placeholder="Opcional" value={formPresentacion.sku} onChange={e => setFormPresentacion({ ...formPresentacion, sku: e.target.value })} fullWidth size="small" />
            </Box>
          </Box>
          <Divider />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>Precio de Compra (Bs.)</Typography>
              <TextField type="number" placeholder="0.00" value={formPresentacion.precio_compra} onChange={e => setFormPresentacion({ ...formPresentacion, precio_compra: e.target.value })} fullWidth size="small" />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>Precio de Venta (Bs.)</Typography>
              <TextField type="number" placeholder="0.00" value={formPresentacion.precio_venta} onChange={e => setFormPresentacion({ ...formPresentacion, precio_venta: e.target.value })} fullWidth size="small" />
            </Box>
          </Box>
          {formPresentacion.precio_compra && formPresentacion.precio_venta && parseFloat(formPresentacion.precio_venta) > 0 && (
            <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <Typography variant="body2" color="#10b981" fontWeight={600}>
                📈 Margen de ganancia: {(((formPresentacion.precio_venta - formPresentacion.precio_compra) / formPresentacion.precio_venta) * 100).toFixed(1)}%
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalPresentacion(false)} color="inherit" sx={{ textTransform: 'none' }}>Cancelar</Button>
          <Button onClick={handleGuardarPresentacion} variant="contained" sx={{ textTransform: 'none' }}>Guardar Presentación</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Editar Presentación */}
      <Dialog open={modalEditarPresentacion} onClose={() => setModalEditarPresentacion(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Presentación</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '24px !important' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>Nombre de la Presentación</Typography>
              <TextField placeholder="Ej. 1 kg / KIT 20 kg" value={formEditarPresentacion.nombre} onChange={e => setFormEditarPresentacion({ ...formEditarPresentacion, nombre: e.target.value })} fullWidth size="small" />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>Unidad de Medida</Typography>
              <FormControl fullWidth size="small">
                <Select value={formEditarPresentacion.unidad_medida_id} onChange={e => setFormEditarPresentacion({ ...formEditarPresentacion, unidad_medida_id: e.target.value })} displayEmpty>
                  <MenuItem value=""><em>Selecciona</em></MenuItem>
                  {catalogos.unidades.map(u => <MenuItem key={u.id} value={u.id}>{u.nombre}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>Código de Barras / QR</Typography>
              <TextField placeholder="Escanea o escribe" value={formEditarPresentacion.codigo_barras} onChange={e => setFormEditarPresentacion({ ...formEditarPresentacion, codigo_barras: e.target.value })} fullWidth size="small" slotProps={{ input: { startAdornment: <InputAdornment position="start"><Barcode size={16} color="#9ca3af" /></InputAdornment> } }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>SKU Interno</Typography>
              <TextField placeholder="Opcional" value={formEditarPresentacion.sku} onChange={e => setFormEditarPresentacion({ ...formEditarPresentacion, sku: e.target.value })} fullWidth size="small" />
            </Box>
          </Box>
          <Divider />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>Precio de Compra (Bs.)</Typography>
              <TextField type="number" placeholder="0.00" value={formEditarPresentacion.precio_compra} onChange={e => setFormEditarPresentacion({ ...formEditarPresentacion, precio_compra: e.target.value })} fullWidth size="small" />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>Precio de Venta (Bs.)</Typography>
              <TextField type="number" placeholder="0.00" value={formEditarPresentacion.precio_venta} onChange={e => setFormEditarPresentacion({ ...formEditarPresentacion, precio_venta: e.target.value })} fullWidth size="small" />
            </Box>
          </Box>
          {formEditarPresentacion.precio_compra && formEditarPresentacion.precio_venta && parseFloat(formEditarPresentacion.precio_venta) > 0 && (
            <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <Typography variant="body2" color="#10b981" fontWeight={600}>
                📈 Margen de ganancia: {(((formEditarPresentacion.precio_venta - formEditarPresentacion.precio_compra) / formEditarPresentacion.precio_venta) * 100).toFixed(1)}%
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalEditarPresentacion(false)} color="inherit" sx={{ textTransform: 'none' }}>Cancelar</Button>
          <Button onClick={handleActualizarPresentacion} variant="contained" sx={{ textTransform: 'none' }}>Actualizar Presentación</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Entrada Almacén */}
      <Dialog open={modalEntrada} onClose={() => setModalEntrada(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Entrada a Almacén</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {selectedPresentacion && (
            <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <Typography variant="body2" fontWeight={700} color="primary.main">{selectedPresentacion.nombre}</Typography>
              <Typography variant="caption" color="text.secondary">Stock actual en almacén: {selectedPresentacion.stock_almacen}</Typography>
            </Box>
          )}
          <Box>
            <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>Cantidad a Ingresar</Typography>
            <TextField type="number" placeholder="0" value={formMovimiento.cantidad} onChange={e => setFormMovimiento({ ...formMovimiento, cantidad: e.target.value })} fullWidth size="small" />
          </Box>
          <Box>
            <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>Nota (Opcional)</Typography>
            <TextField placeholder="Ej. Compra a proveedor Petro" value={formMovimiento.nota} onChange={e => setFormMovimiento({ ...formMovimiento, nota: e.target.value })} fullWidth size="small" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalEntrada(false)} color="inherit" sx={{ textTransform: 'none' }}>Cancelar</Button>
          <Button onClick={handleEntrada} variant="contained" color="success" sx={{ textTransform: 'none' }}>Registrar Entrada</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Traslado a Tienda */}
      <Dialog open={modalTraslado} onClose={() => setModalTraslado(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Trasladar a Tienda</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {selectedPresentacion && (
            <Box sx={{ p: 2, borderRadius: 1, backgroundColor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <Typography variant="body2" fontWeight={700} color="primary.main">{selectedPresentacion.nombre}</Typography>
              <Typography variant="caption" color="text.secondary">Disponible en almacén: {selectedPresentacion.stock_almacen}</Typography>
            </Box>
          )}
          <Box>
            <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>Cantidad a Trasladar</Typography>
            <TextField type="number" placeholder="0" value={formMovimiento.cantidad} onChange={e => setFormMovimiento({ ...formMovimiento, cantidad: e.target.value })} fullWidth size="small" />
          </Box>
          <Box>
            <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>Nota (Opcional)</Typography>
            <TextField placeholder="Ej. Reposición de tienda" value={formMovimiento.nota} onChange={e => setFormMovimiento({ ...formMovimiento, nota: e.target.value })} fullWidth size="small" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalTraslado(false)} color="inherit" sx={{ textTransform: 'none' }}>Cancelar</Button>
          <Button onClick={handleTraslado} variant="contained" color="primary" sx={{ textTransform: 'none' }}>Confirmar Traslado</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ width: '100%', boxShadow: 3 }}>{snackbar.message}</Alert>
      </Snackbar>

      {/* Visor de Imágenes */}
      <Dialog open={visorImagen.open} onClose={() => setVisorImagen({ ...visorImagen, open: false })} maxWidth="md">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="h6" fontWeight={600}>{visorImagen.title}</Typography>
          <IconButton onClick={() => setVisorImagen({ ...visorImagen, open: false })} size="small"><XCircle size={20} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#f3f4f6', minWidth: 300, minHeight: 300 }}>
          <img src={visorImagen.src} alt="Vista previa" style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default InventarioPage;
