import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Avatar, Chip, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Snackbar, Alert, IconButton, InputAdornment, Divider
} from '@mui/material';
import {
  User, Mail, Phone, Shield, Calendar, Clock, Wifi, Activity,
  Lock, Eye, EyeOff, KeyRound, CheckCircle, AlertCircle, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const API = 'http://localhost:3000/api/usuarios/perfil';

const formatFecha = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-BO', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

const formatFechaHora = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-BO', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

// Badge del método HTTP
const metodoBadge = (metodo) => {
  const map = {
    POST:   { label: 'Crear',   color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    PUT:    { label: 'Editar',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    DELETE: { label: 'Eliminar', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
    GET:    { label: 'Ver',     color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  };
  const s = map[metodo] || map.GET;
  return (
    <Box component="span" sx={{
      px: 1.2, py: 0.3, borderRadius: 99, fontSize: '0.68rem', fontWeight: 700,
      color: s.color, bgcolor: s.bg, display: 'inline-block', mr: 1
    }}>
      {s.label}
    </Box>
  );
};

// ─── Modal Cambiar Contraseña ────────────────────────────────────────────────

const ModalCambiarContrasena = ({ open, onClose }) => {
  const { token } = useAuth();
  const [form, setForm] = useState({ contrasena_actual: '', contrasena_nueva: '', confirmar: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState({ actual: false, nueva: false, confirmar: false });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.contrasena_actual || !form.contrasena_nueva) {
      setSnackbar({ open: true, message: 'Completa todos los campos', severity: 'warning' });
      return;
    }
    if (form.contrasena_nueva !== form.confirmar) {
      setSnackbar({ open: true, message: 'Las contraseñas nuevas no coinciden', severity: 'error' });
      return;
    }
    if (form.contrasena_nueva.length < 4) {
      setSnackbar({ open: true, message: 'La contraseña debe tener al menos 4 caracteres', severity: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/usuarios/perfil/contrasena', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contrasena_actual: form.contrasena_actual,
          contrasena_nueva: form.contrasena_nueva
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSnackbar({ open: true, message: data.mensaje, severity: 'success' });
        setForm({ contrasena_actual: '', contrasena_nueva: '', confirmar: '' });
        setTimeout(() => onClose(), 1500);
      } else {
        setSnackbar({ open: true, message: data.mensaje, severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: 'Error de conexión', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const pwdField = (name, label, showKey) => (
    <Box>
      <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 0.8 }}>
        {label}
      </Typography>
      <TextField
        name={name} value={form[name]} onChange={handleChange}
        fullWidth size="small"
        type={showPwd[showKey] ? 'text' : 'password'}
        placeholder={label}
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start"><Lock size={16} color="#9ca3af" /></InputAdornment>,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setShowPwd({ ...showPwd, [showKey]: !showPwd[showKey] })}>
                  {showPwd[showKey] ? <EyeOff size={16} /> : <Eye size={16} />}
                </IconButton>
              </InputAdornment>
            )
          }
        }}
      />
    </Box>
  );

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <KeyRound size={20} color="#6366f1" />
          Cambiar Contraseña
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
          {pwdField('contrasena_actual', 'Contraseña Actual', 'actual')}
          {pwdField('contrasena_nueva', 'Nueva Contraseña', 'nueva')}
          {pwdField('confirmar', 'Confirmar Nueva Contraseña', 'confirmar')}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none' }}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}
            sx={{ textTransform: 'none', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
            {loading ? 'Guardando…' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ boxShadow: 3 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

// ─── PÁGINA DE PERFIL ────────────────────────────────────────────────────────

const PerfilPage = () => {
  const { token } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalPwd, setModalPwd] = useState(false);

  const fetchPerfil = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPerfil(data);
      }
    } catch (e) {
      console.error('Error fetching perfil:', e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchPerfil(); }, [fetchPerfil]);

  if (loading) return <LinearProgress sx={{ borderRadius: 1 }} />;
  if (!perfil) return <Typography color="text.secondary">Error al cargar perfil</Typography>;

  const { usuario, permisos, sesiones, eventos } = perfil;
  const iniciales = `${(usuario.nombre || '')[0] || ''}${(usuario.apellido || '')[0] || ''}`.toUpperCase();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* Header */}
      <Typography variant="h4" fontWeight={700} color="text.primary">Mi Perfil</Typography>

      <Grid container spacing={3}>

        {/* ─── Columna izquierda: Info del usuario ─── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, overflow: 'visible' }}>
            <CardContent sx={{ p: '28px !important', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>

              {/* Avatar grande */}
              <Avatar sx={{
                width: 80, height: 80,
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                fontSize: '1.8rem', fontWeight: 800,
                boxShadow: '0 8px 30px rgba(99,102,241,0.35)',
                border: '4px solid', borderColor: 'background.paper',
                mt: -6,
              }}>
                {iniciales}
              </Avatar>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={800} color="text.primary">
                  {usuario.nombre} {usuario.apellido}
                </Typography>
                <Typography variant="body2" color="primary.main" sx={{ mt: 0.3 }}>
                  {usuario.correo}
                </Typography>
              </Box>

              <Divider sx={{ width: '100%', my: 1 }} />

              {/* Detalles */}
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Phone size={16} color="#9ca3af" />
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Teléfono</Typography>
                    <Typography variant="body2" color="text.primary">{usuario.celular || 'No registrado'}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CheckCircle size={16} color={usuario.estado ? '#10b981' : '#ef4444'} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Estado</Typography>
                    <Box>
                      <Box component="span" sx={{
                        px: 1.5, py: 0.3, borderRadius: 99, fontSize: '0.72rem', fontWeight: 700,
                        color: usuario.estado ? '#10b981' : '#ef4444',
                        bgcolor: usuario.estado ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        display: 'inline-block'
                      }}>
                        {usuario.estado ? 'Activo' : 'Inactivo'}
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Calendar size={16} color="#9ca3af" />
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Miembro desde</Typography>
                    <Typography variant="body2" color="primary.main" fontWeight={500}>
                      {formatFecha(usuario.created_at)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Shield size={16} color="#6366f1" />
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Rol</Typography>
                    <Typography variant="body2" color="text.primary" fontWeight={700}>{usuario.rol}</Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ width: '100%', my: 1 }} />

              <Button
                variant="outlined"
                startIcon={<KeyRound size={16} />}
                onClick={() => setModalPwd(true)}
                fullWidth
                sx={{
                  textTransform: 'none',
                  borderColor: 'rgba(99,102,241,0.3)',
                  color: '#6366f1',
                  fontWeight: 600,
                  '&:hover': { borderColor: '#6366f1', bgcolor: 'rgba(99,102,241,0.06)' }
                }}
              >
                Cambiar Contraseña
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* ─── Columna derecha: Permisos, Sesiones, Eventos ─── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Permisos */}
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: '24px !important' }}>
                <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                  Permisos
                </Typography>
                {permisos.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">Sin permisos asignados</Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {permisos.map((p) => (
                      <Chip
                        key={p}
                        label={p}
                        size="small"
                        variant="outlined"
                        icon={<CheckCircle size={12} />}
                        sx={{
                          fontWeight: 500,
                          fontSize: '0.78rem',
                          borderColor: 'rgba(99,102,241,0.25)',
                          color: 'text.primary',
                          '& .MuiChip-icon': { color: '#10b981' }
                        }}
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Sesiones y Eventos en grid */}
            <Grid container spacing={3}>

              {/* Sesiones */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ borderRadius: 3, height: '100%' }}>
                  <CardContent sx={{ p: '24px !important' }}>
                    <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#6366f1' }} />
                      Sesiones Recientes
                    </Typography>

                    {sesiones.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No hay sesiones registradas</Typography>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 320, overflowY: 'auto' }}>
                        {sesiones.map((s, i) => (
                          <Box key={i} sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5,
                            p: 1.2, borderRadius: 2,
                            bgcolor: i === 0 ? 'rgba(99,102,241,0.06)' : 'transparent',
                            border: i === 0 ? '1px solid rgba(99,102,241,0.15)' : '1px solid transparent',
                            transition: 'all 0.15s',
                            '&:hover': { bgcolor: 'action.hover' }
                          }}>
                            <Box sx={{
                              p: 0.6, borderRadius: 1,
                              bgcolor: i === 0 ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.08)',
                              color: i === 0 ? '#10b981' : '#6366f1',
                              display: 'flex'
                            }}>
                              {i === 0 ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" fontWeight={600} color={i === 0 ? 'primary.main' : 'text.primary'} sx={{ fontSize: '0.82rem' }}>
                                {formatFechaHora(s.created_at)}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{
                              fontFamily: 'monospace', fontSize: '0.7rem',
                              bgcolor: 'action.hover', px: 1, py: 0.2, borderRadius: 1
                            }}>
                              {s.ip || '—'}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Eventos Recientes */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ borderRadius: 3, height: '100%' }}>
                  <CardContent sx={{ p: '24px !important' }}>
                    <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                      Eventos Recientes
                    </Typography>

                    {eventos.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No hay eventos registrados</Typography>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 320, overflowY: 'auto' }}>
                        {eventos.map((ev, i) => (
                          <Box key={i} sx={{
                            p: 1.2, borderRadius: 2,
                            transition: 'all 0.15s',
                            '&:hover': { bgcolor: 'action.hover' }
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {metodoBadge(ev.metodo)}
                              <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ fontSize: '0.82rem' }}>
                                {ev.ruta}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.3, display: 'block' }}>
                              {formatFechaHora(ev.created_at)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

            </Grid>
          </Box>
        </Grid>
      </Grid>

      <ModalCambiarContrasena open={modalPwd} onClose={() => setModalPwd(false)} />
    </Box>
  );
};

export default PerfilPage;
