import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Button, Grid, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, LinearProgress, InputAdornment } from '@mui/material';
import { Edit2, Trash2, UserPlus, Users, Search, Filter, User, Mail, Phone, MapPin } from 'lucide-react';

const ClientesPage = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    correo: '',
    direccion: ''
  });
  const [editingId, setEditingId] = useState(null);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/clientes');
      const data = await response.json();
      setClientes(data);
    } catch (error) {
      console.error('Error fetching clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setFormData({ nombre: '', apellido: '', telefono: '', correo: '', direccion: '' });
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleEditClick = (cliente) => {
    setFormData({
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      telefono: cliente.telefono,
      correo: cliente.correo || '',
      direccion: cliente.direccion || ''
    });
    setEditingId(cliente.id);
    setOpenModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) return;
    
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + `/api/clientes/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setSnackbar({ open: true, message: 'Cliente eliminado exitosamente', severity: 'success' });
        fetchClientes();
      } else {
        const errorData = await response.json();
        setSnackbar({ open: true, message: `Error: ${errorData.mensaje}`, severity: 'error' });
      }
    } catch (error) {
      console.error('Error deleting cliente:', error);
      setSnackbar({ open: true, message: 'Error de conexión con el servidor', severity: 'error' });
    }
  };

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.apellido || !formData.telefono) {
      setSnackbar({ open: true, message: 'Nombre, apellido y teléfono son obligatorios.', severity: 'warning' });
      return;
    }

    try {
      const url = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + (editingId ? `/api/clientes/${editingId}` : '/api/clientes');
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setSnackbar({ open: true, message: `Cliente ${editingId ? 'actualizado' : 'registrado'} exitosamente`, severity: 'success' });
        handleCloseModal();
        fetchClientes();
      } else {
        const errorData = await response.json();
        setSnackbar({ open: true, message: `Error: ${errorData.mensaje}`, severity: 'error' });
      }
    } catch (error) {
      console.error('Error saving cliente:', error);
      setSnackbar({ open: true, message: 'Error de conexión con el servidor', severity: 'error' });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" color="text.primary">
            Gestión de Clientes
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Administra el directorio de clientes de tu negocio.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleOpenModal}
          startIcon={<UserPlus size={18} />}
          sx={{ boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)' }}
        >
          Nuevo Cliente
        </Button>
      </Box>

      {/* KPIs */}
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: '20px !important' }}>
              <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
                <Users size={24} />
              </Box>
              <Box>
                <Typography color="text.secondary" variant="body2" fontWeight={600}>Total Clientes</Typography>
                <Typography variant="h4" color="text.primary">{clientes.length}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters & Table */}
      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}
      <Card sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', borderBottom: 1, borderColor: 'divider' }}>
          <TextField 
            placeholder="Buscar cliente por nombre o teléfono..." 
            size="small"
            sx={{ flexGrow: 1, minWidth: '200px' }}
            slotProps={{ input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} color="#9ca3af" />
                </InputAdornment>
              ),
            } }}
          />
          <Button variant="outlined" sx={{ borderColor: 'divider', color: 'text.secondary', textTransform: 'none' }}>
            <Filter size={18} style={{ marginRight: 8 }} /> Filtrar
          </Button>
        </Box>

        <TableContainer sx={{ maxHeight: 500 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: 'background.default', color: 'text.secondary', fontWeight: 600, borderBottom: 1, borderColor: 'divider' }}>Nombre Completo</TableCell>
                <TableCell sx={{ backgroundColor: 'background.default', color: 'text.secondary', fontWeight: 600, borderBottom: 1, borderColor: 'divider' }}>Teléfono</TableCell>
                <TableCell sx={{ backgroundColor: 'background.default', color: 'text.secondary', fontWeight: 600, borderBottom: 1, borderColor: 'divider' }}>Correo</TableCell>
                <TableCell sx={{ backgroundColor: 'background.default', color: 'text.secondary', fontWeight: 600, borderBottom: 1, borderColor: 'divider' }}>Dirección</TableCell>
                <TableCell sx={{ backgroundColor: 'background.default', color: 'text.secondary', fontWeight: 600, borderBottom: 1, borderColor: 'divider', textAlign: 'right' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientes.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">No hay clientes registrados</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                clientes.map((cliente) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={cliente.id} sx={{ '& td': { borderBottom: 1, borderColor: 'divider' } }}>
                    <TableCell>
                      <Typography variant="body2" color="text.primary" fontWeight={500}>
                        {cliente.nombre} {cliente.apellido}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {cliente.telefono}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {cliente.correo || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {cliente.direccion || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <IconButton size="small" onClick={() => handleEditClick(cliente)} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.light' } }}>
                        <Edit2 size={18} />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteClick(cliente.id)} sx={{ color: 'text.secondary', '&:hover': { color: '#ef4444' } }}>
                        <Trash2 size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Modal de Nuevo/Editar Cliente */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '24px !important' }}>
          
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'text.secondary' }}>
              <User size={18} />
              <Typography variant="body2" fontWeight={600}>Nombre</Typography>
            </Box>
            <TextField
              placeholder="Ej. Carlos"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              fullWidth
              size="small"
            />
          </Box>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'text.secondary' }}>
              <User size={18} />
              <Typography variant="body2" fontWeight={600}>Apellido</Typography>
            </Box>
            <TextField
              placeholder="Ej. Gómez"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              fullWidth
              size="small"
            />
          </Box>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'text.secondary' }}>
              <Phone size={18} />
              <Typography variant="body2" fontWeight={600}>Teléfono</Typography>
            </Box>
            <TextField
              placeholder="Ej. 123456789"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              fullWidth
              size="small"
            />
          </Box>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'text.secondary' }}>
              <Mail size={18} />
              <Typography variant="body2" fontWeight={600}>Correo Electrónico (Opcional)</Typography>
            </Box>
            <TextField
              placeholder="cliente@correo.com"
              name="correo"
              type="email"
              value={formData.correo}
              onChange={handleChange}
              fullWidth
              size="small"
            />
          </Box>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'text.secondary' }}>
              <MapPin size={18} />
              <Typography variant="body2" fontWeight={600}>Dirección (Opcional)</Typography>
            </Box>
            <TextField
              placeholder="Ej. Av. Principal 123"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              fullWidth
              size="small"
            />
          </Box>

        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseModal} color="inherit" sx={{ textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" sx={{ textTransform: 'none' }}>
            {editingId ? 'Actualizar Cliente' : 'Guardar Cliente'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', boxShadow: 3 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClientesPage;
