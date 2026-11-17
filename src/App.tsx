import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { useAuthStore } from "./stores/useAuthStore";

function App() {
  const carregarUsuario = useAuthStore((state) => state.carregarUsuario);

  const authChecking = useAuthStore((state) => state.authChecking);

  useEffect(() => {
    carregarUsuario();
  }, [carregarUsuario]);

  if (authChecking) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p>Verificando autenticação...</p>
      </main>
    );
  }

  return <AppRoutes />;
}

export default App;
