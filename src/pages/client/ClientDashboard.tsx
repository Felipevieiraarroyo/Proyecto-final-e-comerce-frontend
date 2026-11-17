import { useAuthStore } from "../../stores/useAuthStore";

export default function ClientDashboard() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <h1 className="text-3xl font-bold">Minha Loja</h1>

      <p className="mt-4 text-slate-400">Bem-vindo, {user?.email}</p>

      <button onClick={logout} className="mt-6 rounded-lg bg-red-600 px-5 py-2">
        Sair
      </button>
    </main>
  );
}
