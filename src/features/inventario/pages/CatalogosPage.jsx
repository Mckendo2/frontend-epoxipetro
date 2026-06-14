import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Alert, LinearProgress, Grid, Tabs, Tab,
  Divider, Tooltip
} from '@mui/material';
import { Tags, Layers, Edit2, Trash2, Plus } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/inventario';

const CatalogosPage = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [catalogos, setCatalogos] = useState({ categorias: [], marcas: [] });
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', nombre: '', descripcion: '' });

  const notify = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/catalogos`);
      const data = await res.json();
      setCatalogos(data);
    } catch {
      notify('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData({ id: item.id, nombre: item.nombre, descripcion: item.descripcion || '' });
    } else {
      setFormData({ id: '', nombre: '', descripcion: '' });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nombre) return notify('El nombre es obligatorio', 'warning');
    
    const tipo = tabIndex === 0 ? 'categorias' : 'marcas';
    const isEditing = !!formData.id;
    const url = isEditing ? `${API}/${tipo}/${formData.id}` : `${API}/${tipo}`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        notify(`${tabIndex === 0 ? 'Categoría' : 'Marca'} guardada`);
        setModalOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        notify(err.mensaje, 'error');
      }
    } catch {
      notify('Error de conexión', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este registro?')) return;
    const tipo = tabIndex === 0 ? 'categorias' : 'marcas';

    try {
      const res = await fetch(`${API}/${tipo}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        notify('Registro eliminado');
        fetchData();
      } else {
        const err = await res.json();
        notify(err.mensaje, 'error');
      }
    } catch {
      notify('Error de conexión', 'error');
    }
  };

  const currentData = tabIndex === 0 ? catalogos.categorias : catalogos.marcas;
  const label = tabIndex === 0 ? 'Categoría' : 'Marca';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" color="text.primary">Catálogos</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Gestión de atributos de inventario: Categorías y Marcas.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          onClick={() => handleOpenModal()} 
          startIcon={<Plus size={18} />} 
          sx={{ textTransform: 'none', boxShadow: '0 4px 14px 0 rgba(99,102,241,0.39)' }}
        >
          Nueva {label}
        </Button>
      </Box>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)} aria-label="catalog tabs">
            <Tab icon={<Layers size={18} />} iconPosition="start" label="Categorías" sx={{ textTransform: 'none', fontWeight: 600 }} />
            <Tab icon={<Tags size={18} />} iconPosition="start" label="Marcas" sx={{ textTransform: 'none', fontWeight: 600 }} />
          </Tabs>
        </Box>
        
        {loading && <LinearProgress />}
        
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: 'background.default', color: 'text.secondary', fontWeight: 600 }}>Nombre</TableCell>
                {tabIndex === 0 && (
                  <TableCell sx={{ backgroundColor: 'background.default', color: 'text.secondary', fontWeight: 600 }}>Descripción</TableCell>
                )}
                <TableCell sx={{ backgroundColor: 'background.default', color: 'text.secondary', fontWeight: 600, textAlign: 'right', width: 120 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentData.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={tabIndex === 0 ? 3 : 2} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No hay registros de {label.toLowerCase()}s</Typography>
                  </TableCell>
                </TableRow>
              ) : currentData.map(item => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="text.primary">{item.nombre}</Typography>
                  </TableCell>
                  {tabIndex === 0 && (
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{item.descripcion || '-'}</Typography>
                    </TableCell>
                  )}
                  <TableCell sx={{ textAlign: 'right' }}>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => handleOpenModal(item)} sx={{ color: 'text.secondary' }}>
                        <Edit2 size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton size="small" onClick={() => handleDelete(item.id)} sx={{ color: 'error.main' }}>
                        <Trash2 size={16} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{formData.id ? 'Editar' : 'Nueva'} {label}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <Box>
            <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>Nombre</Typography>
            <TextField 
              placeholder={`Nombre de la ${label.toLowerCase()}`} 
              value={formData.nombre} 
              onChange={e => setFormData({ ...formData, nombre: e.target.value })} 
              fullWidth size="small" 
              autoFocus
            />
          </Box>
          {tabIndex === 0 && (
            <Box>
              <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>Descripción (Opcional)</Typography>
              <TextField 
                placeholder="Breve descripción" 
                value={formData.descripcion} 
                onChange={e => setFormData({ ...formData, descripcion: e.target.value })} 
                fullWidth size="small" 
                multiline rows={2}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalOpen(false)} color="inherit" sx={{ textTransform: 'none' }}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" sx={{ textTransform: 'none' }}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ width: '100%', boxShadow: 3 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default CatalogosPage;
