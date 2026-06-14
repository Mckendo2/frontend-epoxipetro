import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, TextField, Grid, InputAdornment, LinearProgress,
  Snackbar, Alert, Select, MenuItem, FormControl, Dialog, DialogTitle, DialogContent, IconButton, Button
} from '@mui/material';
import { Store, Search, AlertTriangle, Barcode, Package, XCircle, QrCode, ChevronDown, Copy, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const API = 'http://localhost:3000/api/inventario';

const formatMonto = (monto) => Number(parseFloat(monto || 0).toFixed(2)).toLocaleString('de-DE');

const TiendaPage = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('nombre');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [visorImagen, setVisorImagen] = useState({ open: false, src: '', title: '' });
  const [modalCatalogo, setModalCatalogo] = useState(false);

  const notify = (message, severity = 'error') => setSnackbar({ open: true, message, severity });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/productos`);
      setProductos(await res.json());
    } catch {
      notify('Error al cargar datos del servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Lista plana: todas las presentaciones (para ver incluso las agotadas en KPIs)
  const stockTienda = productos
    .flatMap(p =>
      p.presentaciones.map(pr => ({ ...pr, producto: p.nombre, categoria: p.categoria, marca: p.marca, created_at: p.created_at, ventas_30_dias: pr.ventas_30_dias, imagen_url: p.imagen_url }))
    );

  const stockFiltrado = stockTienda.filter(pr =>
    pr.producto.toLowerCase().includes(busqueda.toLowerCase()) ||
    pr.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    pr.categoria?.toLowerCase().includes(busqueda.toLowerCase()) ||
    pr.codigo_barras?.includes(busqueda) ||
    pr.sku?.includes(busqueda)
  ).sort((a, b) => {
    if (orden === 'nombre') return a.producto.localeCompare(b.producto);
    if (orden === 'stock') return b.stock_tienda - a.stock_tienda;
    if (orden === 'precio') return parseFloat(b.precio_venta || 0) - parseFloat(a.precio_venta || 0);
    if (orden === 'ventas') return (b.ventas_30_dias || 0) - (a.ventas_30_dias || 0);
    if (orden === 'fecha') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    return 0;
  });

  const stockBajoCount = stockTienda.filter(pr => pr.stock_tienda <= (pr.stock_minimo || 0)).length;
  const totalDisponibles = stockTienda.filter(pr => pr.stock_tienda > 0).length;
  const valorTotal = stockTienda.reduce((acc, pr) => acc + (parseFloat(pr.precio_venta || 0) * (pr.stock_tienda || 0)), 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" color="text.primary">Stock Tienda</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Productos disponibles para la venta en tienda.
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          onClick={() => setModalCatalogo(true)}
          sx={{ display: 'flex', gap: 1, borderRadius: 2, borderColor: 'divider', color: 'text.primary', textTransform: 'none', fontWeight: 600, bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } }}
        >
          <QrCode size={18} />
          Catálogo virtual <ChevronDown size={16} />
        </Button>
      </Box>

      {/* KPIs */}
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: '20px !important' }}>
              <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>
                <Store size={24} />
              </Box>
              <Box>
                <Typography color="text.secondary" variant="body2" fontWeight={600}>Presentaciones Disponibles</Typography>
                <Typography variant="h4" color="text.primary">{totalDisponibles}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} md={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: '20px !important' }}>
              <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                <Package size={24} />
              </Box>
              <Box>
                <Typography color="text.secondary" variant="body2" fontWeight={600}>Valor en Tienda (Bs.)</Typography>
                <Typography variant="h4" color="text.primary">{formatMonto(valorTotal)}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} md={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: '20px !important' }}>
              <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: stockBajoCount > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: stockBajoCount > 0 ? '#ef4444' : '#f59e0b' }}>
                <AlertTriangle size={24} />
              </Box>
              <Box>
                <Typography color="text.secondary" variant="body2" fontWeight={600}>Stock Bajo</Typography>
                <Typography variant="h4" color={stockBajoCount > 0 ? 'error.main' : 'text.primary'}>{stockBajoCount}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla */}
      {loading && <LinearProgress sx={{ borderRadius: 1 }} />}
      <Card sx={{ overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar por nombre, categoría, código de barras o SKU..."
            size="small"
            sx={{ flex: 1, minWidth: '300px' }}
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={18} color="#9ca3af" /></InputAdornment> } }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select value={orden} onChange={e => setOrden(e.target.value)} displayEmpty sx={{ borderRadius: 1.5 }}>
              <MenuItem value="nombre">Ordenar por nombre</MenuItem>
              <MenuItem value="stock">Por stock (Mayor a menor)</MenuItem>
              <MenuItem value="ventas">Por ventas (Últimos 30 días)</MenuItem>
              <MenuItem value="fecha">Por fecha de creación</MenuItem>
              <MenuItem value="precio">Por precio (Mayor a menor)</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: 'background.default', color: 'text.secondary', fontWeight: 600, borderColor: 'divider' }}>Producto</TableCell>
                <TableCell sx={{ backgroundColor: 'background.default', color: 'text.secondary', fontWeight: 600, borderColor: 'divider' }}>Presentación</TableCell>
                <TableCell sx={{ backgroundColor: 'background.default', color: 'text.secondary', fontWeight: 600, borderColor: 'divider' }}>Código</TableCell>
                <TableCell sx={{ backgroundColor: 'background.default', color: 'text.secondary', fontWeight: 600, borderColor: 'divider' }}>Precio Venta</TableCell>
                <TableCell sx={{ backgroundColor: 'background.default', color: 'text.secondary', fontWeight: 600, borderColor: 'divider' }}>Stock</TableCell>
                <TableCell sx={{ backgroundColor: 'background.default', color: 'text.secondary', fontWeight: 600, borderColor: 'divider' }}>Categoría</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stockFiltrado.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                      <Store size={48} color="#9ca3af" />
                      <Typography color="text.secondary" fontWeight={600}>No hay productos en tienda</Typography>
                      <Typography variant="caption" color="text.disabled">
                        Ve al módulo de Almacén → traslada productos a Tienda para verlos aquí.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : stockFiltrado.map(pr => {
                const stockBajoAlerta = pr.stock_tienda <= pr.stock_minimo && pr.stock_minimo > 0;
                return (
                  <TableRow key={pr.id} hover sx={{ '& td': { borderColor: 'divider' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box 
                          onClick={(e) => {
                            if(pr.imagen_url) {
                              e.stopPropagation();
                              setVisorImagen({ open: true, src: `http://localhost:3000${pr.imagen_url}`, title: pr.producto });
                            }
                          }}
                          sx={{ 
                            width: 40, height: 40, borderRadius: 2, overflow: 'hidden', display: 'flex', 
                            alignItems: 'center', justifyContent: 'center', 
                            bgcolor: pr.imagen_url ? 'transparent' : 'rgba(99,102,241,0.08)',
                            cursor: pr.imagen_url ? 'zoom-in' : 'default',
                            transition: 'all 0.2s',
                            '&:hover': pr.imagen_url ? { transform: 'scale(1.05)', boxShadow: 1 } : {}
                          }}
                        >
                          {pr.imagen_url ? (
                            <img src={`http://localhost:3000${pr.imagen_url}`} alt={pr.producto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Package size={20} color="#6366f1" />
                          )}
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={600} color="text.primary">{pr.producto}</Typography>
                          <Typography variant="caption" color="text.secondary">{pr.marca || ''}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.primary">{pr.nombre}</Typography>
                      <Typography variant="caption" color="text.secondary">{pr.unidad}</Typography>
                    </TableCell>
                    <TableCell>
                      {pr.codigo_barras ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Barcode size={14} color="#9ca3af" />
                          <Typography variant="caption" color="text.secondary">{pr.codigo_barras}</Typography>
                        </Box>
                      ) : <Typography variant="caption" color="text.disabled">Sin código</Typography>}
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6" color="primary.main" fontWeight={800}>
                        Bs. {formatMonto(pr.precio_venta)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {stockBajoAlerta && <AlertTriangle size={14} color="#ef4444" />}
                        <Chip
                          label={`${pr.stock_tienda} ${pr.unidad}`}
                          size="small"
                          sx={{
                            backgroundColor: stockBajoAlerta ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                            color: stockBajoAlerta ? '#ef4444' : '#10b981',
                            fontWeight: 700,
                            borderRadius: 1.5
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={pr.categoria || 'Sin categoría'}
                        size="small"
                        sx={{ backgroundColor: 'rgba(99,102,241,0.1)', color: '#6366f1', fontWeight: 600, borderRadius: 1.5 }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

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

      {/* Modal de Catálogo Virtual */}
      <Dialog open={modalCatalogo} onClose={() => setModalCatalogo(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, pb: 2 }}>
          <Typography variant="h5" fontWeight={700}>Comparte el link de tu catálogo</Typography>
          <IconButton onClick={() => setModalCatalogo(false)} size="small" sx={{ bgcolor: 'action.hover' }}><XCircle size={20} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 0 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Tus clientes podrán visualizar tu catálogo. Si deseas apagar algún producto ingresa al producto y desactívalo.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center' }}>
            <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: 1, borderColor: 'divider', display: 'flex', justifyContent: 'center' }}>
              <QRCodeSVG value={`${window.location.origin}/catalogo`} size={150} level="M" />
            </Box>
            
            <Box sx={{ flexGrow: 1, width: '100%' }}>
              <Box 
                sx={{ 
                  display: 'flex', alignItems: 'center', p: 1.5, border: 1, borderColor: 'divider', 
                  borderRadius: 2, mb: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } 
                }}
                onClick={() => window.open(`${window.location.origin}/catalogo`, '_blank')}
              >
                <ExternalLink size={18} style={{ marginRight: 12, color: '#6b7280' }} />
                <Typography variant="body2" sx={{ flexGrow: 1, wordBreak: 'break-all' }}>
                  {window.location.origin}/catalogo
                </Typography>
                <ChevronDown size={18} style={{ transform: 'rotate(-90deg)', color: '#6b7280' }} />
              </Box>
              
              <Button 
                variant="outlined" 
                fullWidth 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/catalogo`);
                  notify('Link copiado al portapapeles', 'success');
                }}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, color: 'text.primary', borderColor: 'divider' }}
                startIcon={<Copy size={18} />}
              >
                Copiar link
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TiendaPage;
