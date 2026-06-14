import React, { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, useTheme, Collapse } from '@mui/material';
import { LayoutDashboard, Users, ShieldCheck, Warehouse, Store, ShoppingCart, TrendingDown, Contact, Bookmark, DollarSign, LogOut, Activity, Lock, ChevronDown, ChevronUp, BarChart, ClipboardList, Truck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { text: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/', permiso: 'view_dashboard' },
  { text: 'Almacén Central', icon: <Warehouse size={20} />, path: '/almacen', permiso: 'manage_inventario' },
  { text: 'Catálogos', icon: <Bookmark size={20} />, path: '/catalogos', permiso: 'manage_inventario' },
  { text: 'Tienda/Sucursal', icon: <Store size={20} />, path: '/tienda', permiso: 'manage_inventario' },
  { text: 'Ventas', icon: <ShoppingCart size={20} />, path: '/ventas', permiso: 'manage_ventas' },
  { text: 'Cotizaciones', icon: <ClipboardList size={20} />, path: '/cotizaciones', permiso: 'manage_cotizaciones' },
  { text: 'Movimientos', icon: <DollarSign size={20} />, path: '/movimientos', permiso: 'manage_caja' },
  { text: 'Reportes', icon: <BarChart size={20} />, path: '/reportes', permiso: 'view_reportes' },
  { text: 'Clientes', icon: <Contact size={20} />, path: '/clientes', permiso: 'manage_clientes' },
  { text: 'Proveedores', icon: <Truck size={20} />, path: '/proveedores', permiso: 'manage_proveedores' },
  { text: 'Auditoría', icon: <Activity size={20} />, path: '/auditoria', permiso: 'view_auditoria' },
];

const Sidebar = ({ isDesktop, mobileOpen, desktopOpen, onMobileClose, drawerWidth, collapsedDrawerWidth }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, hasPermission } = useAuth();
  
  const [securityOpen, setSecurityOpen] = useState(false);

  const currentWidth = isDesktop ? (desktopOpen ? drawerWidth : collapsedDrawerWidth) : drawerWidth;

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ 
        height: 70, 
        display: 'flex', 
        alignItems: 'center', 
        px: desktopOpen || !isDesktop ? 3 : 0,
        justifyContent: desktopOpen || !isDesktop ? 'flex-start' : 'center',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            flexShrink: 0,
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
          }}
        >
          A
        </Box>
        {(desktopOpen || !isDesktop) && (
          <Typography variant="h6" sx={{ ml: 1.5, fontWeight: 700, letterSpacing: '-0.5px', whiteSpace: 'nowrap' }}>
            Alvarez<span style={{ color: '#6366f1' }}>App</span>
          </Typography>
        )}
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 2, px: 1.5 }}>
        <List sx={{ p: 0, gap: 0.5, display: 'flex', flexDirection: 'column' }}>
        {menuItems.map((item) => {
          if (!hasPermission(item.permiso)) return null;
          return (
            <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (!isDesktop) onMobileClose();
                }}
                sx={{
                  minHeight: 48,
                  justifyContent: desktopOpen ? 'initial' : 'center',
                  px: 2.5,
                  mx: 1,
                  borderRadius: 2,
                  bgcolor: location.pathname === item.path ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  color: location.pathname === item.path ? '#3b82f6' : 'text.primary',
                  '&:hover': {
                    bgcolor: location.pathname === item.path ? 'rgba(59, 130, 246, 0.2)' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: desktopOpen ? 2 : 'auto',
                    justifyContent: 'center',
                    color: location.pathname === item.path ? '#3b82f6' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    opacity: desktopOpen ? 1 : 0,
                    '& .MuiTypography-root': {
                      fontWeight: location.pathname === item.path ? 600 : 400,
                      fontSize: '0.9rem'
                    }
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}

        {/* GRUPO DE SEGURIDAD Y ROLES */}
        {(hasPermission('manage_usuarios') || hasPermission('manage_roles') || hasPermission('manage_permisos')) && (
          <>
            <ListItem disablePadding sx={{ display: 'block', mb: 0.5, mt: 1 }}>
              <ListItemButton
                onClick={() => {
                  if (desktopOpen) setSecurityOpen(!securityOpen);
                }}
                sx={{
                  minHeight: 48,
                  justifyContent: desktopOpen ? 'initial' : 'center',
                  px: 2.5,
                  mx: 1,
                  borderRadius: 2,
                  color: 'text.primary',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: desktopOpen ? 2 : 'auto', justifyContent: 'center', color: 'text.secondary' }}>
                  <Lock size={20} />
                </ListItemIcon>
                <ListItemText primary="Seguridad" sx={{ opacity: desktopOpen ? 1 : 0, '& .MuiTypography-root': { fontSize: '0.9rem' } }} />
                {desktopOpen && (securityOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
              </ListItemButton>
            </ListItem>

            <Collapse in={securityOpen && desktopOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {[
                  { text: 'Usuarios', icon: <Users size={18} />, path: '/usuarios', req: 'manage_usuarios' },
                  { text: 'Roles', icon: <ShieldCheck size={18} />, path: '/roles', req: 'manage_roles' },
                  { text: 'Permisos', icon: <ShieldCheck size={18} />, path: '/permisos', req: 'manage_permisos' }
                ].map((subItem) => {
                  if (!hasPermission(subItem.req)) return null;
                  return (
                    <ListItemButton
                      key={subItem.text}
                      onClick={() => { navigate(subItem.path); if (!isDesktop) onMobileClose(); }}
                      sx={{
                        pl: 4, mx: 1, mb: 0.5, minHeight: 40, borderRadius: 2,
                        bgcolor: location.pathname === subItem.path ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                        color: location.pathname === subItem.path ? '#3b82f6' : 'text.secondary',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 0, mr: 2, color: 'inherit' }}>{subItem.icon}</ListItemIcon>
                      <ListItemText primary={subItem.text} sx={{ '& .MuiTypography-root': { fontSize: '0.85rem' } }} />
                    </ListItemButton>
                  );
                })}
              </List>
            </Collapse>
          </>
        )}
        </List>
      </Box>
      <Box sx={{ p: 1.5, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              logout();
              navigate('/login');
            }}
            sx={{
              borderRadius: '10px',
              minHeight: 44,
              justifyContent: desktopOpen || !isDesktop ? 'initial' : 'center',
              px: desktopOpen || !isDesktop ? 2 : 0,
              color: '#ef4444',
              '&:hover': {
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
              },
              transition: 'all 0.2s',
            }}
            title={!desktopOpen && isDesktop ? 'Cerrar Sesión' : ''}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: desktopOpen || !isDesktop ? 2 : 0,
                justifyContent: 'center',
                color: 'inherit',
              }}
            >
              <LogOut size={20} />
            </ListItemIcon>
            {(desktopOpen || !isDesktop) && (
              <ListItemText 
                primary="Cerrar Sesión" 
                primaryTypographyProps={{ 
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }} 
              />
            )}
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isDesktop ? "permanent" : "temporary"}
      open={isDesktop ? true : mobileOpen}
      onClose={onMobileClose}
      sx={{
        width: currentWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        '& .MuiDrawer-paper': {
          width: currentWidth,
          overflowX: 'hidden',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
