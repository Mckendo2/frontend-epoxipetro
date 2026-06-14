import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Button, Grid, TextField, MenuItem, Select, FormControl, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, Switch, FormControlLabel, Snackbar, Alert, LinearProgress, Tooltip } from '@mui/material';
import { Edit2, Trash2, UserPlus, Users, UserCheck, ShieldCheck, Search, Filter, User, Mail, Phone, Lock, Power } from 'lucide-react';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    celular: '',
    contraseña: '',
    rol_id: 2, // Default Vendedor
    estado: true // Activo por defecto
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/usuarios');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setFormData({ nombre: '', apellido: '', correo: '', celular: '', contraseña: '', rol_id: 2, estado: true });
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.correo || !formData.contraseña) {
      setSnackbar({ open: true, message: 'Por favor completa todos los campos obligatorios.', severity: 'warning' });
      return;
    }

    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setSnackbar({ open: true, message: 'Usuario registrado exitosamente', severity: 'success' });
        handleCloseModal();
        fetchUsers();
      } else {
        const errorData = await response.json();
        setSnackbar({ open: true, message: `Error: ${errorData.mensaje}`, severity: 'error' });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setSnackbar({ open: true, message: 'Error de conexión con el servidor', severity: 'error' });
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/usuarios/${id}/estado`, {
        method: 'PUT',
      });
      
      if (response.ok) {
        const data = await response.json();
        setSnackbar({ open: true, message: data.mensaje, severity: 'success' });
        fetchUsers();
      } else {
        setSnackbar({ open: true, message: 'Error al cambiar el estado del usuario', severity: 'error' });
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      setSnackbar({ open: true, message: 'Error de conexión con el servidor', severity: 'error' });
    }
  };

  const activeUsers = users.filter(u => u.estado).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" color="text.primary">
            Gestión de Usuarios
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Administra los usuarios del sistema y sus roles asignados.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleOpenModal}
          startIcon={<UserPlus size={18} />}
          sx={{ boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)' }}
        >
          Nuevo Usuario
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
                <Typography color="text.secondary" variant="body2" fontWeight={600}>Total Registrados</Typography>
                <Typography variant="h4" color="text.primary">{users.length}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} md={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: '20px !important' }}>
              <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                <UserCheck size={24} />
              </Box>
              <Box>
                <Typography color="text.secondary" variant="body2" fontWeight={600}>Usuarios Activos</Typography>
                <Typography variant="h4" color="text.primary">{activeUsers}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} md={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: '20px !important' }}>
              <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                <ShieldCheck size={24} />
              </Box>
              <Box>
                <Typography color="text.secondary" variant="body2" fontWeight={600}>Roles Disponibles</Typography>
                <Typography variant="h4" color="text.primary">3</Typography>
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
            placeholder="Buscar usuario por nombre o correo..." 
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
          <FormControl size="small" sx={{ minWidth: '160px' }}>
            <Select defaultValue="todos" displayEmpty>
              <MenuItem value="todos">Todos los Roles</MenuItem>
              <MenuItem value="Administrador">Administrador</MenuItem>
              <MenuItem value="Vendedor">Vendedor</MenuItem>
              <MenuItem value="Almacenero">Almacenero</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: '160px' }}>
            <Select defaultValue="todos" displayEmpty>
              <MenuItem value="todos">Todos los Estados</MenuItem>
              <MenuItem value="activo">Activo</MenuItem>
              <MenuItem value="inactivo">Inactivo</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" sx={{ borderColor: 'divider', color: 'text.secondary', textTransform: 'none' }}>
            <Filter size={18} style={{ marginRight: 8 }} /> Filtrar
          </Button>
        </Box>

        <TableContainer sx={{ maxHeight: 500 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: 'background.default', color: 'text.secondary', fontWeight: 600, borderBottom: 1, borderColor: 'divider' }}>Nombre Completo</TableCell>
                <TableCell sx={{ backgroundColor: 'background.default', color: 'text.secondary', fontWeight: 600, borderBottom: 1, borderColor: 'divider' }}>Correo</TableCell>
                <TableCell sx={{ backgroundColor: 'background.default', color: 'text.secondary', fontWeight: 600, borderBottom: 1, borderColor: 'divider' }}>Celular</TableCell>
                <TableCell sx={{ backgroundColor: 'background.default', color: 'text.secondary', fontWeight: 600, borderBottom: 1, borderColor: 'divider' }}>Rol</TableCell>
                <TableCell sx={{ backgroundColor: 'background.default', color: 'text.secondary', fontWeight: 600, borderBottom: 1, borderColor: 'divider' }}>Estado</TableCell>
                <TableCell sx={{ backgroundColor: 'background.default', color: 'text.secondary', fontWeight: 600, borderBottom: 1, borderColor: 'divider', textAlign: 'right' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">No hay usuarios registrados</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={user.id} sx={{ '& td': { borderBottom: 1, borderColor: 'divider' } }}>
                    <TableCell>
                      <Typography variant="body2" color="text.primary" fontWeight={500}>
                        {user.nombre} {user.apellido || ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.correo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.celular || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.rol} 
                        size="small" 
                        sx={{ 
                          backgroundColor: user.rol === 'Administrador' ? 'rgba(99, 102, 241, 0.15)' : 'action.hover',
                          color: user.rol === 'Administrador' ? '#6366f1' : 'text.secondary',
                          fontWeight: 600,
                          borderRadius: 1.5
                        }} 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.estado ? 'Activo' : 'Inactivo'} 
                        size="small" 
                        sx={{ 
                          backgroundColor: user.estado ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: user.estado ? '#10b981' : '#ef4444',
                          fontWeight: 600,
                          borderRadius: 1.5
                        }} 
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <Tooltip title="Editar Usuario">
                        <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.light' } }}>
                          <Edit2 size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={user.rol === 'Administrador' ? "No se puede desactivar a un Administrador" : (user.estado ? "Apagar (Desactivar Usuario)" : "Prender (Activar Usuario)")}>
                        <span>
                          <IconButton 
                            size="small" 
                            disabled={user.rol === 'Administrador'}
                            onClick={() => handleToggleStatus(user.id, user.estado)}
                            sx={{ 
                              color: user.estado ? '#10b981' : '#ef4444', 
                              '&:hover': { color: user.estado ? '#059669' : '#dc2626' } 
                            }}
                          >
                            <Power size={18} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Modal de Nuevo Usuario */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Registrar Nuevo Usuario</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '24px !important' }}>
          
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'text.secondary' }}>
              <User size={18} />
              <Typography variant="body2" fontWeight={600}>Nombre</Typography>
            </Box>
            <TextField
              placeholder="Ej. Juan"
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
              placeholder="Ej. Pérez"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              fullWidth
              size="small"
            />
          </Box>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'text.secondary' }}>
              <Mail size={18} />
              <Typography variant="body2" fontWeight={600}>Correo Electrónico</Typography>
            </Box>
            <TextField
              placeholder="ejemplo@correo.com"
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
              <Phone size={18} />
              <Typography variant="body2" fontWeight={600}>Celular</Typography>
            </Box>
            <TextField
              placeholder="Ej. 123456789"
              name="celular"
              value={formData.celular}
              onChange={handleChange}
              fullWidth
              size="small"
            />
          </Box>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'text.secondary' }}>
              <Lock size={18} />
              <Typography variant="body2" fontWeight={600}>Contraseña</Typography>
            </Box>
            <TextField
              placeholder="Ingresa una contraseña segura"
              name="contraseña"
              type="password"
              value={formData.contraseña}
              onChange={handleChange}
              fullWidth
              size="small"
            />
          </Box>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'text.secondary' }}>
              <ShieldCheck size={18} />
              <Typography variant="body2" fontWeight={600}>Rol de Usuario</Typography>
            </Box>
            <FormControl fullWidth size="small">
              <Select
                name="rol_id"
                value={formData.rol_id}
                onChange={handleChange}
              >
                <MenuItem value={1}>Administrador</MenuItem>
                <MenuItem value={2}>Vendedor</MenuItem>
                <MenuItem value={3}>Almacenero</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mt: 1, p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider', backgroundColor: 'background.default' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.estado}
                  onChange={handleChange}
                  name="estado"
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" fontWeight={600} color={formData.estado ? 'primary.main' : 'text.secondary'}>
                  {formData.estado ? "Usuario Activo" : "Usuario Inactivo"}
                </Typography>
              }
            />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, ml: 5 }}>
              {formData.estado ? "Este usuario podrá iniciar sesión en el sistema." : "Este usuario no tendrá acceso al sistema."}
            </Typography>
          </Box>

        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseModal} color="inherit" sx={{ textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" sx={{ textTransform: 'none' }}>
            Guardar Usuario
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

export default UsersPage;
