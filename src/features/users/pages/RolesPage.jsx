import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Alert, LinearProgress, Chip, Tooltip
} from '@mui/material';
import {
  ShieldCheck, Plus, Search, Edit2, Trash2, CheckCircle, ShieldAlert
} from 'lucide-react';

const API_ROLES = 'http://localhost:3000/api/roles';

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Modal forms
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ id: null, nombre: '', descripcion: '' });
  const [guardando, setGuardando] = useState(false);

  const notify = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_ROLES);
      const data = await res.json();
      if (res.ok) setRoles(data);
      else notify(data.mensaje || 'Error al obtener roles', 'error');
    } catch {
      notify('Error de conexión', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleOpenModal = (rol = null) => {
    if (rol) {
      setForm({ id: rol.id, nombre: rol.nombre, descripcion: rol.descripcion || '' });
    } else {
      setForm({ id: null, nombre: '', descripcion: '' });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setForm({ id: null, nombre: '', descripcion: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return notify('El nombre del rol es obligatorio', 'warning');

    setGuardando(true);
    try {
      const isEditing = !!form.id;
      const url = isEditing ? `${API_ROLES}/${form.id}` : API_ROLES;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (res.ok) {
        notify(data.mensaje);
        handleCloseModal();
        fetchRoles();
      } else {
        notify(data.mensaje, 'error');
      }
    } catch {
      notify('Error de conexión', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const eliminarRol = async (id, nombre) => {
    if (nombre.toLowerCase() === 'administrador') {
      return notify('No puedes eliminar el rol de Administrador', 'error');
    }
    if (!window.confirm(`¿Estás seguro de eliminar el rol "${nombre}"?`)) return;

    try {
      const res = await fetch(`${API_ROLES}/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        notify(data.mensaje);
        fetchRoles();
      } else {
        notify(data.mensaje, 'error');
      }
    } catch {
      notify('Error de conexión', 'error');
    }
  };

  const rolesFiltrados = roles.filter(r =>
    r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (r.descripcion || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" color="text.primary" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            Roles y Permisos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Administra los roles del sistema y sus descripciones.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => handleOpenModal()}
          startIcon={<Plus size={18} />}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '10px',
            px: 3,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            boxShadow: '0 4px 14px 0 rgba(99,102,241,0.39)',
          }}
        >
          Nuevo Rol
        </Button>
      </Box>

      {/* Main Content */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              placeholder="Buscar rol..."
              size="small"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              sx={{ minWidth: 250, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              slotProps={{
                input: {
                  startAdornment: <Search size={18} color="#9ca3af" style={{ marginRight: 8 }} />
                }
              }}
            />
          </Box>

          {loading ? (
            <LinearProgress />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'background.default' }}>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', width: '25%' }}>Rol</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', width: '50%' }}>Descripción</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', width: '15%' }}>Creado en</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', width: '10%' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rolesFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          <ShieldAlert size={40} color="#9ca3af" />
                          <Typography color="text.secondary">No se encontraron roles</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    rolesFiltrados.map(rol => (
                      <TableRow key={rol.id} hover sx={{ '& td': { borderColor: 'divider' } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ 
                              p: 1, 
                              borderRadius: 1.5, 
                              backgroundColor: rol.nombre.toLowerCase() === 'administrador' ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)', 
                              color: rol.nombre.toLowerCase() === 'administrador' ? '#ef4444' : '#6366f1' 
                            }}>
                              <ShieldCheck size={20} />
                            </Box>
                            <Typography variant="body2" fontWeight={600} color="text.primary">
                              {rol.nombre}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {rol.descripcion || <span style={{ fontStyle: 'italic', color: '#9ca3af' }}>Sin descripción</span>}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary" fontWeight={500}>
                            {new Date(rol.created_at).toLocaleDateString('es-BO')}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                            <Tooltip title="Editar">
                              <IconButton 
                                size="small" 
                                color="primary" 
                                onClick={() => handleOpenModal(rol)}
                                sx={{ backgroundColor: 'rgba(99,102,241,0.05)', '&:hover': { backgroundColor: 'rgba(99,102,241,0.1)' } }}
                              >
                                <Edit2 size={16} />
                              </IconButton>
                            </Tooltip>
                            {rol.nombre.toLowerCase() !== 'administrador' && (
                              <Tooltip title="Eliminar">
                                <IconButton 
                                  size="small" 
                                  color="error" 
                                  onClick={() => eliminarRol(rol.id, rol.nombre)}
                                  sx={{ backgroundColor: 'rgba(239,68,68,0.05)', '&:hover': { backgroundColor: 'rgba(239,68,68,0.1)' } }}
                                >
                                  <Trash2 size={16} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Modal Form */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShieldCheck size={20} color="#6366f1" />
          {form.id ? 'Editar Rol' : 'Nuevo Rol'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nombre del Rol"
              autoFocus
              fullWidth
              size="small"
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              required
            />
            <TextField
              label="Descripción"
              fullWidth
              size="small"
              multiline
              rows={3}
              value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseModal} color="inherit" sx={{ textTransform: 'none' }}>Cancelar</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={guardando}
              sx={{ textTransform: 'none', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
            >
              {guardando ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default RolesPage;
