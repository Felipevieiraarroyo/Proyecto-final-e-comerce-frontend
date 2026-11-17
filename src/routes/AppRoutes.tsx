import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import ProtectedRoute from "../components/ProtectedRoute";

import AdminDashboard from "../pages/admin/AdminDashboard";
import CashierDashboard from "../pages/cashier/CashierDashboard";
import ClientDashboard from "../pages/client/ClientDashboard";

import { useAuthStore } from "../stores/useAuthStore";

function UnauthorizedPage() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
      <h1 className="text-3xl font-bold">Acesso não autorizado</h1>

      <p className="mt-3 text-slate-400">
        Você não tem permissão para acessar esta página.
      </p>

      <button onClick={logout} className="mt-6 rounded-lg bg-red-600 px-5 py-2">
        Sair
      </button>
    </main>
  );
}

export default function AppRoutes() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const user = useAuthStore((state) => state.user);

  const rotaInicial = () => {
    if (!isAuthenticated || !user) return "/login";

    switch (user.role) {
      case "ADMIN":
        return "/admin";

      case "CAJERO":
        return "/cashier";

      case "CLIENTE":
        return "/client";

      default:
        return "/login";
    }
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={rotaInicial()} replace />
          ) : (
            <LoginPage />
          )
        }
      />

      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["CAJERO"]} />}>
        <Route path="/cashier" element={<CashierDashboard />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["CLIENTE"]} />}>
        <Route path="/client" element={<ClientDashboard />} />
      </Route>

      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route path="/" element={<Navigate to={rotaInicial()} replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
