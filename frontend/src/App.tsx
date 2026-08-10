import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

import LoginPage from "./features/auth/LoginPage";
import LandingPage from "./features/landing/LandingPage";

import PosPage from "./features/pos/PosPage";
import FiadoPage from "./features/fiado/FiadoPage";
import InventarioPage from "./features/inventario/InventarioPage";
import DashboardPage from "./features/dashboard/DashboardPage";
import VentasPage from "./features/ventas/VentasPage";

import Layout from "./components/layout/Layout";

import ForbiddenPage from "./features/auth/ForbiddenPage";

// Guards
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { user, token } = useAuthStore();
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.rol)) {
    // Si no tiene permiso, mostrar página de acceso denegado envuelta en Layout para no perder la navegación
    return <Layout><ForbiddenPage /></Layout>;
  }

  return <Layout>{children}</Layout>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, token } = useAuthStore();
  
  if (token && user) {
    return <Navigate to={user.rol === 'cajero' ? '/pos' : '/dashboard'} replace />;
  }
  
  return <>{children}</>;
};

import { Toaster } from 'sonner';

function App() {
  const { user } = useAuthStore();

  return (
    <>
      <Toaster position="top-center" richColors />
      <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      
      {/* Root - Landing Page Publica */}
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />

      {/* Cajero & Dueño */}
      <Route path="/pos" element={<ProtectedRoute allowedRoles={['cajero', 'dueno']}><PosPage /></ProtectedRoute>} />
      <Route path="/fiado" element={<ProtectedRoute allowedRoles={['cajero', 'dueno']}><FiadoPage /></ProtectedRoute>} />

      {/* Solo Dueño */}
      <Route path="/inventario" element={<ProtectedRoute allowedRoles={['dueno']}><InventarioPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['dueno']}><DashboardPage /></ProtectedRoute>} />
      <Route path="/ventas" element={<ProtectedRoute allowedRoles={['dueno']}><VentasPage /></ProtectedRoute>} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}

export default App;
