import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, Grid, List, ListItem, ListItemButton, 
  ListItemText, Switch, Button, CircularProgress, Divider 
} from '@mui/material';
import { ShieldCheck, Save, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const ROLES_API = 'http://localhost:3000/api/roles';
const PERMISOS_API = 'http://localhost:3000/api/permisos';

const PermisosPage = () => {
  const { hasPermission } = useAuth();
  const [roles, setRoles] = useState([]);
  const [selectedRol, setSelectedRol] = useState(null);
  
  const [todosPermisos, setTodosPermisos] = useState([]);
  const [permisosRol, setPermisosRol] = useState([]); // IDs de permisos asignados
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRoles();
    fetchTodosPermisos();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await fetch(ROLES_API);
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
        if (data.length > 0) handleSelectRol(data[0]);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchTodosPermisos = async () => {
    try {
      const res = await fetch(PERMISOS_API);
      if (res.ok) {
        const data = await res.json();
        setTodosPermisos(data);
      }
    } catch (error) {
      console.error('Error fetching permisos:', error);
    }
  };

  const handleSelectRol = async (rol) => {
    setSelectedRol(rol);
    setLoading(true);
    try {
      const res = await fetch(`${PERMISOS_API}/rol/${rol.id}`);
      if (res.ok) {
        const data = await res.json();
        setPermisosRol(data);
      }
    } catch (error) {
      console.error('Error fetching permisos del rol:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermiso = (permisoId) => {
    // Evitar que el Administrador (id=1 o nombre=Administrador) se quede sin el permiso de gestionar permisos, por seguridad
    if (selectedRol?.nombre === 'Administrador' && permisoId === todosPermisos.find(p => p.codigo === 'manage_permisos')?.id) {
      alert("No puedes quitarle el permiso de gestión de permisos al Administrador Principal por seguridad.");
      return;
    }

    setPermisosRol(prev => 
      prev.includes(permisoId)
        ? prev.filter(id => id !== permisoId)
        : [...prev, permisoId]
    );
  };

  const handleGuardarPermisos = async () => {
    if (!selectedRol) return;
    setSaving(true);
    try {
      const res = await fetch(`${PERMISOS_API}/rol/${selectedRol.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permisos_ids: permisosRol })
      });
      if (res.ok) {
        alert('Permisos guardados correctamente. Los usuarios de este rol deberán iniciar sesión nuevamente para ver los cambios.');
      } else {
        alert('Hubo un error al guardar los permisos.');
      }
    } catch (error) {
      console.error('Error saving permisos:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!hasPermission('manage_permisos')) {
    return (
      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'error.main' }}>
        <ShieldAlert size={64} style={{ marginBottom: 16 }} />
        <Typography variant="h5" fontWeight="bold">Acceso Denegado</Typography>
        <Typography>No tienes permisos para ver esta sección.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <ShieldCheck size={28} style={{ marginRight: 8, color: '#3b82f6' }} />
        <Typography variant="h5" fontWeight="bold">
          Gestión de Accesos y Permisos
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Selecciona un rol de la lista para ver o modificar qué secciones puede operar en el sistema.
      </Typography>

      <Grid container spacing={4}>
        {/* Lado Izquierdo: Roles */}
        <Grid xs={12} md={4}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <Box sx={{ bgcolor: 'background.default', p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography fontWeight="bold">Roles del Sistema</Typography>
            </Box>
            <List disablePadding>
              {roles.map(rol => (
                <React.Fragment key={rol.id}>
                  <ListItem disablePadding>
                    <ListItemButton 
                      selected={selectedRol?.id === rol.id}
                      onClick={() => handleSelectRol(rol)}
                      sx={{ 
                        '&.Mui-selected': { bgcolor: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid #3b82f6' },
                        py: 2
                      }}
                    >
                      <ListItemText 
                        primary={<Typography fontWeight={selectedRol?.id === rol.id ? "bold" : "normal"}>{rol.nombre}</Typography>} 
                        secondary={rol.descripcion} 
                      />
                    </ListItemButton>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Card>
        </Grid>

        {/* Lado Derecho: Permisos */}
        <Grid xs={12} md={8}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ bgcolor: 'background.default', p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography fontWeight="bold">
                Permisos para: {selectedRol ? selectedRol.nombre : '...'}
              </Typography>
              <Button 
                variant="contained" 
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save size={20} />}
                onClick={handleGuardarPermisos}
                disabled={saving || !selectedRol}
              >
                Guardar Cambios
              </Button>
            </Box>

            <Box sx={{ p: 0, flex: 1 }}>
              {loading ? (
                <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress />
                </Box>
              ) : (
                <List disablePadding>
                  {todosPermisos.map(permiso => (
                    <React.Fragment key={permiso.id}>
                      <ListItem 
                        sx={{ 
                          py: 2, px: 3, 
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                      >
                        <ListItemText 
                          primary={<Typography fontWeight="bold">{permiso.descripcion}</Typography>} 
                          secondary={`Código interno: ${permiso.codigo}`} 
                        />
                        <Switch 
                          edge="end"
                          color="primary"
                          checked={permisosRol.includes(permiso.id)}
                          onChange={() => handleTogglePermiso(permiso.id)}
                          disabled={selectedRol?.nombre === 'Administrador' && permiso.codigo === 'manage_permisos'}
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PermisosPage;
