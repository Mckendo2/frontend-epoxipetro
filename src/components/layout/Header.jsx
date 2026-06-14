import React, { useState } from 'react';
import { AppBar, Avatar, Box, IconButton, Toolbar, Typography, Badge, useTheme, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Menu as MenuIcon, Bell, AlignLeft, Sun, Moon, User, Shield, LogOut, ChevronDown } from 'lucide-react';
import { useColorMode } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = ({ onMobileMenuClick, onDesktopMenuClick, drawerWidth, isDesktop, desktopOpen }) => {
  const theme = useTheme();
  const { toggleColorMode, mode } = useColorMode();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  // Iniciales del usuario para el avatar
  const iniciales = user
    ? `${(user.nombre || '')[0] || ''}${(user.apellido || '')[0] || ''}`.toUpperCase()
    : 'U';

  const nombreCompleto = user ? `${user.nombre || ''} ${user.apellido || ''}`.trim() : 'Usuario';
  const rolNombre = user?.rol_nombre || 'Sin rol';
  const correo = user?.correo || '';

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '70px !important', px: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMobileMenuClick}
            sx={{ display: { md: 'none' }, color: 'text.secondary' }}
          >
            <MenuIcon size={20} />
          </IconButton>

          <IconButton
            color="inherit"
            edge="start"
            onClick={onDesktopMenuClick}
            sx={{ display: { xs: 'none', md: 'flex' }, color: 'text.secondary', ml: -1, mr: 1 }}
          >
            <AlignLeft size={20} />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
          {/* Botón Dark/Light Mode */}
          <IconButton onClick={toggleColorMode} sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
            {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </IconButton>

          <IconButton sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
            <Badge badgeContent={2} color="primary" sx={{ '& .MuiBadge-badge': { backgroundColor: '#6366f1', color: 'white' } }}>
              <Bell size={20} />
            </Badge>
          </IconButton>

          {/* ─── Botón de usuario con menú ─── */}
          <Box
            onClick={handleMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              ml: 1,
              pl: 2,
              borderLeft: '1px solid',
              borderColor: 'divider',
              cursor: 'pointer',
              borderRadius: 2,
              py: 0.5,
              pr: 1,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(99, 102, 241, 0.06)',
              },
            }}
          >
            <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'right' }}>
              <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.3 }}>
                {nombreCompleto}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                {rolNombre}
              </Typography>
            </Box>
            <Avatar
              sx={{
                width: 38,
                height: 38,
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                fontWeight: 700,
                fontSize: '0.85rem',
                border: '2px solid',
                borderColor: 'divider',
                boxShadow: '0 0 12px rgba(99, 102, 241, 0.25)',
              }}
            >
              {iniciales}
            </Avatar>
            <ChevronDown
              size={14}
              style={{
                color: theme.palette.text.secondary,
                transition: 'transform 0.2s',
                transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{
              paper: {
                elevation: 8,
                sx: {
                  mt: 1.5,
                  minWidth: 260,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  overflow: 'visible',
                  '&::before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 20,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    borderLeft: '1px solid',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    zIndex: 0,
                  },
                },
              },
            }}
          >
            {/* Cabecera del menú con info del usuario */}
            <Box sx={{ px: 2.5, pt: 2, pb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  sx={{
                    width: 46,
                    height: 46,
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    fontWeight: 700,
                    fontSize: '1rem',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                  }}
                >
                  {iniciales}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight={700} color="text.primary">
                    {nombreCompleto}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {correo}
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  mt: 1.5,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 99,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.6,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#6366f1',
                  bgcolor: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.15)',
                }}
              >
                <Shield size={12} />
                {rolNombre}
              </Box>
            </Box>

            <Divider sx={{ my: 1 }} />

            <MenuItem
              onClick={() => { handleMenuClose(); navigate('/perfil'); }}
              sx={{
                mx: 1,
                borderRadius: 2,
                gap: 1.5,
                py: 1.2,
                '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.08)' },
              }}
            >
              <ListItemIcon sx={{ color: 'text.secondary', minWidth: 0 }}>
                <User size={18} />
              </ListItemIcon>
              <ListItemText
                primary="Mi Perfil"
                slotProps={{ primary: { fontWeight: 600, fontSize: '0.875rem' } }}
              />
            </MenuItem>

            <MenuItem
              onClick={handleLogout}
              sx={{
                mx: 1,
                borderRadius: 2,
                color: '#ef4444',
                '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.08)' },
                gap: 1.5,
                py: 1.2,
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 0 }}>
                <LogOut size={18} />
              </ListItemIcon>
              <ListItemText
                primary="Cerrar Sesión"
                slotProps={{ primary: { fontWeight: 600, fontSize: '0.875rem' } }}
              />
            </MenuItem>

            <Box sx={{ height: 8 }} />
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
