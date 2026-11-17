import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ShoppingBag, LockKeyhole, Mail } from "lucide-react";

import { loginSchema, type LoginFormData } from "../schemas/loginSchema";
import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (dados: LoginFormData) => {
    setSucesso(false);

    try {
      await login(dados);

      const user = useAuthStore.getState().user;

      if (!user) return;

      switch (user.role) {
        case "ADMIN":
          navigate("/admin", { replace: true });
          break;

        case "CAJERO":
          navigate("/cashier", { replace: true });
          break;

        case "CLIENTE":
          navigate("/client", { replace: true });
          break;

        default:
          navigate("/login", { replace: true });
      }
    } catch {
      setSucesso(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-4">
            <ShoppingBag size={32} className="text-white" />
          </div>

          <h1 className="text-3xl font-bold text-white">POS & E-commerce</h1>

          <p className="text-slate-400 mt-2">
            Entre na sua conta para continuar
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-6">
            Acessar sistema
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                E-mail
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="email"
                  placeholder="seu@email.com"
                  {...register("email")}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white outline-none focus:border-indigo-500"
                />
              </div>

              {errors.email && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Senha</label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Digite sua senha"
                  {...register("password")}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-12 text-white outline-none focus:border-indigo-500"
                />

                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            {sucesso && user && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg p-3 text-sm">
                Login realizado com sucesso! Perfil: {user.role}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? "Entrando..." : "Entrar no sistema"}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          POS & E-commerce — Sistema de gerenciamento
        </p>
      </div>
    </main>
  );
}
