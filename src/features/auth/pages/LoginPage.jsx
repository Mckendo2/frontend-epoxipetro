import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, InputAdornment,
  IconButton, CircularProgress, Divider
} from '@mui/material';
import { Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const LoginPage = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'setup'
  const [checkingSetup, setCheckingSetup] = useState(true);

  // Login fields
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');

  // Setup fields
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [setupCorreo, setSetupCorreo] = useState('');
  const [celular, setCelular] = useState('');
  const [setupPass, setSetupPass] = useState('');
  const [setupPass2, setSetupPass2] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Al cargar, verificar si el sistema necesita configuración inicial
  useEffect(() => {
    fetch(`${BASE}/api/auth/setup`)
      .then(r => r.json())
      .then(data => {
        if (data.needsSetup) setMode('setup');
      })
      .catch(() => {}) // si falla, queda en login normal
      .finally(() => setCheckingSetup(false));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contraseña })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.usuario);
        navigate('/');
      } else {
        setError(data.mensaje || 'Error al iniciar sesión');
      }
    } catch {
      setError('No se pudo conectar al servidor. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (setupPass !== setupPass2) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/auth/setup/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre, apellido, correo: setupCorreo,
          celular, contraseña: setupPass
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('¡Administrador creado! Ahora puedes iniciar sesión.');
        setMode('login');
        setCorreo(setupCorreo);
      } else {
        setError(data.mensaje || 'Error al crear el administrador.');
      }
    } catch {
      setError('No se pudo conectar al servidor. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#1e293b',
      borderRadius: '8px',
      color: '#f8fafc',
      '& fieldset': { borderColor: '#334155' },
      '&:hover fieldset': { borderColor: '#475569' },
      '&.Mui-focused fieldset': { borderColor: '#6366f1' },
    },
    '& .MuiInputBase-input': {
      padding: '12px 14px',
      fontSize: '0.95rem',
      '&::placeholder': { color: '#64748b', opacity: 1 }
    }
  };

  if (checkingSetup) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' }}>
        <CircularProgress sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#0f172a' }}>

      {/* LEFT SIDE - FORM */}
      <Box sx={{
        flex: { xs: 1, md: 0.45 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        p: { xs: 4, sm: 8, md: 12 },
        backgroundColor: '#0f172a',
        overflowY: 'auto'
      }}>
        <Box sx={{ maxWidth: 450, width: '100%', mx: 'auto' }}>

          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '1.2rem', fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(99,102,241,0.4)'
            }}>A</Box>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#fff' }}>
              Alvarez<span style={{ color: '#6366f1' }}>App</span>
            </Typography>
          </Box>

          {/* Título */}
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#ffffff', mb: 0.5 }}>
            {mode === 'setup' ? '🛠️ Configuración Inicial' : 'Bienvenido'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 4 }}>
            {mode === 'setup'
              ? 'El sistema está vacío. Crea tu cuenta de administrador para comenzar.'
              : 'Ingresa tus credenciales para acceder al sistema.'}
          </Typography>

          {/* Alertas */}
          {error && (
            <Box sx={{ p: 2, mb: 3, borderRadius: 2, backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)' }}>
              <Typography variant="body2" color="#fca5a5" textAlign="center">{error}</Typography>
            </Box>
          )}
          {success && (
            <Box sx={{ p: 2, mb: 3, borderRadius: 2, backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.4)' }}>
              <Typography variant="body2" color="#86efac" textAlign="center">{success}</Typography>
            </Box>
          )}

          {/* ══════════ FORMULARIO LOGIN ══════════ */}
          {mode === 'login' && (
            <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 1, fontWeight: 500 }}>
                  Correo Electrónico <span style={{ color: '#ef4444' }}>*</span>
                </Typography>
                <TextField fullWidth variant="outlined" type="email"
                  placeholder="tu@correo.com" value={correo}
                  onChange={e => setCorreo(e.target.value)} required sx={inputStyles} />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 1, fontWeight: 500 }}>
                  Contraseña <span style={{ color: '#ef4444' }}>*</span>
                </Typography>
                <TextField fullWidth variant="outlined"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••" value={contraseña}
                  onChange={e => setContraseña(e.target.value)} required sx={inputStyles}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#64748b' }}>
                            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </Box>

              <Button type="submit" fullWidth variant="contained" disabled={loading}
                startIcon={!loading && <LogIn size={18} />}
                sx={{
                  mt: 1, py: 1.5, backgroundColor: '#6366f1', color: '#fff',
                  borderRadius: '8px', textTransform: 'none', fontSize: '1rem', fontWeight: 600,
                  boxShadow: 'none',
                  '&:hover': { backgroundColor: '#4f46e5', boxShadow: 'none' },
                  '&:disabled': { backgroundColor: '#475569', color: '#94a3b8' }
                }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar Sesión'}
              </Button>
            </Box>
          )}

          {/* ══════════ FORMULARIO SETUP ══════════ */}
          {mode === 'setup' && (
            <Box component="form" onSubmit={handleSetup} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 1, fontWeight: 500 }}>
                    Nombre <span style={{ color: '#ef4444' }}>*</span>
                  </Typography>
                  <TextField fullWidth variant="outlined" placeholder="Tu nombre"
                    value={nombre} onChange={e => setNombre(e.target.value)} required sx={inputStyles} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 1, fontWeight: 500 }}>
                    Apellido
                  </Typography>
                  <TextField fullWidth variant="outlined" placeholder="Tu apellido"
                    value={apellido} onChange={e => setApellido(e.target.value)} sx={inputStyles} />
                </Box>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 1, fontWeight: 500 }}>
                  Correo Electrónico <span style={{ color: '#ef4444' }}>*</span>
                </Typography>
                <TextField fullWidth variant="outlined" type="email" placeholder="admin@tuempresa.com"
                  value={setupCorreo} onChange={e => setSetupCorreo(e.target.value)} required sx={inputStyles} />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 1, fontWeight: 500 }}>
                  Celular
                </Typography>
                <TextField fullWidth variant="outlined" placeholder="70000000"
                  value={celular} onChange={e => setCelular(e.target.value)} sx={inputStyles} />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 1, fontWeight: 500 }}>
                  Contraseña <span style={{ color: '#ef4444' }}>*</span>
                </Typography>
                <TextField fullWidth variant="outlined"
                  type={showPassword ? 'text' : 'password'} placeholder="Mínimo 6 caracteres"
                  value={setupPass} onChange={e => setSetupPass(e.target.value)} required sx={inputStyles}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#64748b' }}>
                            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 1, fontWeight: 500 }}>
                  Confirmar Contraseña <span style={{ color: '#ef4444' }}>*</span>
                </Typography>
                <TextField fullWidth variant="outlined"
                  type={showPassword ? 'text' : 'password'} placeholder="Repite tu contraseña"
                  value={setupPass2} onChange={e => setSetupPass2(e.target.value)} required sx={inputStyles} />
              </Box>

              <Box sx={{ mt: 1, p: 2, borderRadius: 2, backgroundColor: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)' }}>
                <Typography variant="caption" sx={{ color: '#a5b4fc' }}>
                  ℹ️ Esta cuenta tendrá <strong>acceso total</strong> al sistema (rol Administrador). Una vez creada, este formulario no volverá a aparecer.
                </Typography>
              </Box>

              <Button type="submit" fullWidth variant="contained" disabled={loading}
                startIcon={!loading && <UserPlus size={18} />}
                sx={{
                  py: 1.5, backgroundColor: '#6366f1', color: '#fff',
                  borderRadius: '8px', textTransform: 'none', fontSize: '1rem', fontWeight: 600,
                  boxShadow: 'none',
                  '&:hover': { backgroundColor: '#4f46e5', boxShadow: 'none' },
                  '&:disabled': { backgroundColor: '#475569', color: '#94a3b8' }
                }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Crear Administrador'}
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* RIGHT SIDE - BRANDING */}
      <Box sx={{
        flex: { xs: 0, md: 0.55 },
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          opacity: 0.07,
          backgroundImage: `linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
        <Box sx={{ position: 'absolute', width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.05)', top: '30%', left: '20%' }} />
        <Box sx={{ position: 'absolute', width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.05)', top: '40%', right: '25%' }} />
        <Box sx={{ position: 'absolute', width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.05)', top: '60%', left: '35%' }} />
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', px: 6, textAlign: 'center' }}>
          <Box sx={{
            width: 72, height: 72, borderRadius: '18px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '2rem', fontWeight: 'bold', mb: 3,
            boxShadow: '0 8px 30px rgba(99,102,241,0.5)'
          }}>A</Box>
          <Typography variant="h3" fontWeight="bold" sx={{ color: '#ffffff', letterSpacing: '-0.5px', mb: 2 }}>
            Alvarez<span style={{ color: '#6366f1' }}>App</span>
          </Typography>
          <Typography variant="body1" sx={{ color: '#94a3b8', maxWidth: 380 }}>
            Sistema de Gestión y Control de Inventarios, Ventas y Caja para negocios modernos.
          </Typography>
          <Divider sx={{ width: 60, borderColor: '#334155', my: 3 }} />
          <Box sx={{ display: 'flex', gap: 4 }}>
            {['Inventario', 'Ventas', 'Reportes'].map(tag => (
              <Box key={tag} sx={{
                px: 2, py: 0.8, borderRadius: '20px',
                backgroundColor: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.3)'
              }}>
                <Typography variant="caption" sx={{ color: '#a5b4fc', fontWeight: 600 }}>{tag}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
