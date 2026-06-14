import React, { useState } from 'react';
import { Box, Typography, TextField, Button, InputAdornment, IconButton, Checkbox, FormControlLabel, Link, CircularProgress } from '@mui/material';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:3000/api/auth/login';

const LoginPage = () => {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contraseña })
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token, data.usuario);
        navigate('/'); // Redirigir al dashboard
      } else {
        setError(data.mensaje || 'Error al iniciar sesión');
      }
    } catch (err) {
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
      '& fieldset': {
        borderColor: '#334155',
      },
      '&:hover fieldset': {
        borderColor: '#475569',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#6366f1',
      },
    },
    '& .MuiInputBase-input': {
      padding: '12px 14px',
      fontSize: '0.95rem',
      '&::placeholder': {
        color: '#64748b',
        opacity: 1,
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#0f172a' }}>

      {/* LEFT SIDE - FORM */}
      <Box sx={{
        flex: { xs: 1, md: 0.45 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        p: { xs: 4, sm: 8, md: 12 },
        backgroundColor: '#0f172a'
      }}>
        <Box sx={{ maxWidth: 450, width: '100%', mx: 'auto' }}>
          <Typography variant="h3" fontWeight="bold" sx={{ color: '#ffffff', mb: 1, fontSize: '2rem' }}>
            Inicio Sesion
          </Typography>
          <Typography variant="body1" sx={{ color: '#94a3b8', mb: 5 }}>
            Ingresa tu correo y contraseña para acceder.
          </Typography>

          {error && (
            <Box sx={{ width: '100%', p: 2, mb: 3, borderRadius: 2, backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid', borderColor: 'rgba(239, 68, 68, 0.5)' }}>
              <Typography variant="body2" color="#fca5a5" textAlign="center">
                {error}
              </Typography>
            </Box>
          )}

          <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* EMAIL INPUT */}
            <Box>
              <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 1, fontWeight: 500 }}>
                Correo Electrónico <span style={{ color: '#ef4444' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                type="email"
                placeholder="info@gmail.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                sx={inputStyles}
              />
            </Box>

            {/* PASSWORD INPUT */}
            <Box>
              <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 1, fontWeight: 500 }}>
                Contraseña <span style={{ color: '#ef4444' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                type={showPassword ? 'text' : 'password'}
                placeholder="Ingresa tu contraseña"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                required
                sx={inputStyles}
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

            {/* OPTIONS */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    sx={{
                      color: '#475569',
                      '&.Mui-checked': { color: '#6366f1' },
                      padding: '4px 8px'
                    }}
                  />
                }
                label={<Typography variant="body2" sx={{ color: '#94a3b8' }}>Mantener sesión iniciada</Typography>}
                sx={{ m: 0 }}
              />
            </Box>

            {/* SUBMIT BUTTON */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 1,
                py: 1.5,
                backgroundColor: '#6366f1',
                color: '#ffffff',
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#4f46e5',
                  boxShadow: 'none',
                },
                '&:disabled': {
                  backgroundColor: '#475569',
                  color: '#94a3b8'
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>
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
        {/* Decorative Grid Pattern */}
        <Box sx={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          opacity: 0.1,
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />

        {/* Subtle glowing or dark squares to mimic the image */}
        <Box sx={{ position: 'absolute', width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.05)', top: '30%', left: '20%' }} />
        <Box sx={{ position: 'absolute', width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.05)', top: '40%', right: '25%' }} />
        <Box sx={{ position: 'absolute', width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.05)', top: '60%', left: '35%' }} />

        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.5)'
            }}>
              A
            </Box>
            <Typography variant="h3" fontWeight="bold" sx={{ color: '#ffffff', letterSpacing: '-0.5px' }}>
              Alvarez<span style={{ color: '#6366f1' }}>App</span>
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: '#94a3b8', textAlign: 'center', maxWidth: 400 }}>
            Sistema de Gestión y Control de Inventarios, Ventas y Caja para negocios modernos.
          </Typography>
        </Box>
      </Box>

    </Box>
  );
};

export default LoginPage;
