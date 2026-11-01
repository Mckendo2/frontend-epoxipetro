import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
const MainLayout = lazy(() => import('./components/layout/MainLayout'));
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));
const DashboardPage = lazy(() => import('./features/dashboard/pages/DashboardPage'));
const UsersPage = lazy(() => import('./features/users/pages/UsersPage'));
const RolesPage = lazy(() => import('./features/users/pages/RolesPage'));
const ClientesPage = lazy(() => import('./features/clientes/pages/ClientesPage'));
const InventarioPage = lazy(() => import('./features/inventario/pages/InventarioPage'));
const CatalogosPage = lazy(() => import('./features/inventario/pages/CatalogosPage'));
const TiendaPage = lazy(() => import('./features/inventario/pages/TiendaPage'));
const VentasPage = lazy(() => import('./features/ventas/pages/VentasPage'));
const CotizacionesPage = lazy(() => import('./features/cotizaciones/pages/CotizacionesPage'));
const MovimientosPage = lazy(() => import('./features/caja/pages/MovimientosPage'));
const AuditoriaPage = lazy(() => import('./features/auditoria/pages/AuditoriaPage'));
const PermisosPage = lazy(() => import('./features/users/pages/PermisosPage'));
const ReportesPage = lazy(() => import('./features/reportes/pages/ReportesPage'));
const CatalogoPublicoPage = lazy(() => import('./features/catalogo/pages/CatalogoPublicoPage'));
const ProveedoresPage = lazy(() => import('./features/proveedores/pages/ProveedoresPage'));
const PerfilPage = lazy(() => import('./features/perfil/pages/PerfilPage'));
import LandingPage from './features/landing/pages/LandingPage';

const ProtectedRoute = ({ children, permisoRequerido }) => {
  const { isAuthenticated, hasPermission } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (permisoRequerido && !hasPermission(permisoRequerido)) {
    // Si está autenticado pero no tiene el permiso, lo enviamos al dashboard
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Si el visitante no está autenticado, / muestra la landing comercial.
// Si ya inició sesión como personal, lo redirige al dashboard del sistema.
const RootRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Suspense fallback={<div className="min-h-screen bg-[#0f172a]" aria-busy="true" />}>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<RootRoute />} />
            <Route path="/inicio" element={<LandingPage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/catalogo" element={<CatalogoPublicoPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Rutas protegidas del Sistema ERP */}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="usuarios" element={<ProtectedRoute permisoRequerido="manage_usuarios"><UsersPage /></ProtectedRoute>} />
              <Route path="roles" element={<ProtectedRoute permisoRequerido="manage_roles"><RolesPage /></ProtectedRoute>} />
              <Route path="permisos" element={<ProtectedRoute permisoRequerido="manage_permisos"><PermisosPage /></ProtectedRoute>} />
              <Route path="clientes" element={<ProtectedRoute permisoRequerido="manage_clientes"><ClientesPage /></ProtectedRoute>} />
              <Route path="almacen" element={<ProtectedRoute permisoRequerido="manage_inventario"><InventarioPage /></ProtectedRoute>} />
              <Route path="tienda" element={<ProtectedRoute permisoRequerido="manage_inventario"><TiendaPage /></ProtectedRoute>} />
              <Route path="catalogos" element={<ProtectedRoute permisoRequerido="manage_inventario"><CatalogosPage /></ProtectedRoute>} />
              <Route path="cotizaciones" element={<ProtectedRoute permisoRequerido="manage_cotizaciones"><CotizacionesPage /></ProtectedRoute>} />
              <Route path="ventas" element={<ProtectedRoute permisoRequerido="manage_ventas"><VentasPage /></ProtectedRoute>} />
              <Route path="movimientos" element={<ProtectedRoute permisoRequerido="manage_caja"><MovimientosPage /></ProtectedRoute>} />
              <Route path="auditoria" element={<ProtectedRoute permisoRequerido="view_auditoria"><AuditoriaPage /></ProtectedRoute>} />
              <Route path="reportes" element={<ProtectedRoute permisoRequerido="view_reportes"><ReportesPage /></ProtectedRoute>} />
              <Route path="proveedores" element={<ProtectedRoute permisoRequerido="manage_proveedores"><ProveedoresPage /></ProtectedRoute>} />
              <Route path="perfil" element={<ProtectedRoute><PerfilPage /></ProtectedRoute>} />
            </Route>
          </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
