import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './features/auth/pages/LoginPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import UsersPage from './features/users/pages/UsersPage';
import RolesPage from './features/users/pages/RolesPage';
import ClientesPage from './features/clientes/pages/ClientesPage';
import InventarioPage from './features/inventario/pages/InventarioPage';
import CatalogosPage from './features/inventario/pages/CatalogosPage';
import TiendaPage from './features/inventario/pages/TiendaPage';
import VentasPage from './features/ventas/pages/VentasPage';
import CotizacionesPage from './features/cotizaciones/pages/CotizacionesPage';
import MovimientosPage from './features/caja/pages/MovimientosPage';
import AuditoriaPage from './features/auditoria/pages/AuditoriaPage';
import PermisosPage from './features/users/pages/PermisosPage';
import ReportesPage from './features/reportes/pages/ReportesPage';
import CatalogoPublicoPage from './features/catalogo/pages/CatalogoPublicoPage';
import ProveedoresPage from './features/proveedores/pages/ProveedoresPage';
import PerfilPage from './features/perfil/pages/PerfilPage';

const ProtectedRoute = ({ children, permisoRequerido }) => {
  const { isAuthenticated, hasPermission } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (permisoRequerido && !hasPermission(permisoRequerido)) {
    // Si está autenticado pero no tiene el permiso, lo enviamos al dashboard
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/catalogo" element={<CatalogoPublicoPage />} />
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
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
            {/* Otras rutas irán aquí */}
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
