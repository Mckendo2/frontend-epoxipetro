import { useState } from 'react';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const drawerWidth = 260;
const collapsedDrawerWidth = 80;

const MainLayout = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);

  const handleMobileDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDesktopDrawerToggle = () => {
    setDesktopOpen(!desktopOpen);
  };

  const currentDrawerWidth = isDesktop ? (desktopOpen ? drawerWidth : collapsedDrawerWidth) : drawerWidth;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header 
        onMobileMenuClick={handleMobileDrawerToggle} 
        onDesktopMenuClick={handleDesktopDrawerToggle}
        drawerWidth={currentDrawerWidth} 
        isDesktop={isDesktop}
        desktopOpen={desktopOpen}
      />
      
      <Sidebar 
        isDesktop={isDesktop}
        mobileOpen={mobileOpen}
        desktopOpen={desktopOpen}
        onMobileClose={handleMobileDrawerToggle}
        drawerWidth={drawerWidth}
        collapsedDrawerWidth={collapsedDrawerWidth}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          backgroundColor: 'background.default',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar sx={{ minHeight: '70px !important' }} />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
