import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  ShoppingBag,
  LockKeyhole,
  Mail,
  User,
  Phone,
  CreditCard,
  UserRoundPlus,
  LogIn,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { loginSchema, type LoginFormData } from "../schemas/loginSchema";
import {
  registerSchema,
  type RegisterFormData,
} from "../schemas/registerSchema";
import { useAuthStore } from "../stores/useAuthStore";
import ThemeToggle from "../components/ThemeToggle";

export default function LoginPage() {
  const [modoCadastro, setModoCadastro] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);

  const navigate = useNavigate();

  const formularioLogin = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const formularioCadastro = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const alternarModo = (cadastro: boolean) => {
    setModoCadastro(cadastro);
    setMostrarSenha(false);
    setMostrarConfirmacao(false);

    useAuthStore.setState({ error: null });

    formularioLogin.reset();
    formularioCadastro.reset();
  };

  const onSubmitLogin = async (dados: LoginFormData) => {
    try {
      await login(dados);

      const usuario = useAuthStore.getState().user;

      if (!usuario) return;

      switch (usuario.role) {
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
    } catch {}
  };

  const onSubmitCadastro = async (dados: RegisterFormData) => {
    const payload = {
      name: dados.name,
      email: dados.email,
      password: dados.password,
      phone: dados.phone,
      document: dados.document,
    };

    try {
      await register(payload);

      navigate("/client", { replace: true });
    } catch {}
  };

  const inputClass =
    "w-full rounded-xl border px-4 py-3 pl-11 outline-none transition focus:ring-2 focus:ring-emerald-500/30";

  const inputStyle = {
    backgroundColor: "var(--color-surface-muted)",
    borderColor: "var(--color-border)",
    color: "var(--color-text)",
  };

  const labelClass = "mb-2 block text-sm font-medium";

  return (
    <main
      className="flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="fixed right-5 top-5">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "#ffffff",
            }}
          >
            <ShoppingBag size={32} />
          </div>

          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: "var(--color-text)" }}
          >
            POS & E-commerce
          </h1>

          <p
            className="mt-2 text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            Sua experiência de compra começa aqui
          </p>

          <div
            className="mx-auto mt-4 h-1 w-16 rounded-full"
            style={{ backgroundColor: "var(--color-accent)" }}
          />
        </div>

        <div
          className="rounded-2xl border p-6 shadow-xl sm:p-8"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <div
            className="mb-6 grid grid-cols-2 gap-2 rounded-xl p-1"
            style={{ backgroundColor: "var(--color-surface-muted)" }}
          >
            <button
              type="button"
              onClick={() => alternarModo(false)}
              className="flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition"
              style={
                !modoCadastro
                  ? {
                      backgroundColor: "var(--color-primary)",
                      color: "#ffffff",
                    }
                  : { color: "var(--color-text-muted)" }
              }
            >
              <LogIn size={17} />
              Entrar
            </button>

            <button
              type="button"
              onClick={() => alternarModo(true)}
              className="flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition"
              style={
                modoCadastro
                  ? {
                      backgroundColor: "var(--color-primary)",
                      color: "#ffffff",
                    }
                  : { color: "var(--color-text-muted)" }
              }
            >
              <UserRoundPlus size={17} />
              Criar conta
            </button>
          </div>

          <h2
            className="mb-1 text-xl font-bold"
            style={{ color: "var(--color-text)" }}
          >
            {modoCadastro ? "Crie sua conta" : "Bem-vindo de volta"}
          </h2>

          <p
            className="mb-6 text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            {modoCadastro
              ? "Preencha seus dados para começar a comprar."
              : "Entre na sua conta para continuar."}
          </p>

          {!modoCadastro ? (
            <form
              onSubmit={formularioLogin.handleSubmit(onSubmitLogin)}
              className="space-y-5"
            >
              <div>
                <label className={labelClass}>E-mail</label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--color-text-muted)" }}
                  />

                  <input
                    type="email"
                    placeholder="seu@email.com"
                    {...formularioLogin.register("email")}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>

                {formularioLogin.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {formularioLogin.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>Senha</label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--color-text-muted)" }}
                  />

                  <input
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Digite sua senha"
                    {...formularioLogin.register("password")}
                    className={`${inputClass} pr-12`}
                    style={inputStyle}
                  />

                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--color-text-muted)" }}
                    aria-label={
                      mostrarSenha ? "Ocultar senha" : "Mostrar senha"
                    }
                  >
                    {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {formularioLogin.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-500">
                    {formularioLogin.formState.errors.password.message}
                  </p>
                )}
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                {loading ? "Entrando..." : "Entrar no sistema"}
              </button>
            </form>
          ) : (
            <form
              onSubmit={formularioCadastro.handleSubmit(onSubmitCadastro)}
              className="space-y-4"
            >
              <div>
                <label className={labelClass}>Nome completo</label>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--color-text-muted)" }}
                  />

                  <input
                    type="text"
                    placeholder="Seu nome completo"
                    {...formularioCadastro.register("name")}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>

                {formularioCadastro.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {formularioCadastro.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>E-mail</label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--color-text-muted)" }}
                  />

                  <input
                    type="email"
                    placeholder="seu@email.com"
                    {...formularioCadastro.register("email")}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>

                {formularioCadastro.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {formularioCadastro.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>Telefone</label>

                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--color-text-muted)" }}
                  />

                  <input
                    type="tel"
                    placeholder="Seu telefone"
                    {...formularioCadastro.register("phone")}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>

                {formularioCadastro.formState.errors.phone && (
                  <p className="mt-1 text-sm text-red-500">
                    {formularioCadastro.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>Documento</label>

                <div className="relative">
                  <CreditCard
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--color-text-muted)" }}
                  />

                  <input
                    type="text"
                    placeholder="CPF ou documento"
                    {...formularioCadastro.register("document")}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>

                {formularioCadastro.formState.errors.document && (
                  <p className="mt-1 text-sm text-red-500">
                    {formularioCadastro.formState.errors.document.message}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>Senha</label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--color-text-muted)" }}
                  />

                  <input
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Mínimo de 8 caracteres"
                    {...formularioCadastro.register("password")}
                    className={`${inputClass} pr-12`}
                    style={inputStyle}
                  />

                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--color-text-muted)" }}
                    aria-label={
                      mostrarSenha ? "Ocultar senha" : "Mostrar senha"
                    }
                  >
                    {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {formularioCadastro.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-500">
                    {formularioCadastro.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>Confirmar senha</label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--color-text-muted)" }}
                  />

                  <input
                    type={mostrarConfirmacao ? "text" : "password"}
                    placeholder="Digite a senha novamente"
                    {...formularioCadastro.register("confirmPassword")}
                    className={`${inputClass} pr-12`}
                    style={inputStyle}
                  />

                  <button
                    type="button"
                    onClick={() => setMostrarConfirmacao(!mostrarConfirmacao)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--color-text-muted)" }}
                    aria-label={
                      mostrarConfirmacao
                        ? "Ocultar confirmação"
                        : "Mostrar confirmação"
                    }
                  >
                    {mostrarConfirmacao ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {formularioCadastro.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {
                      formularioCadastro.formState.errors.confirmPassword
                        .message
                    }
                  </p>
                )}
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                {loading ? "Criando conta..." : "Criar minha conta"}
              </button>
            </form>
          )}
        </div>

        <p
          className="mt-6 text-center text-sm"
          style={{ color: "var(--color-text-muted)" }}
        >
          {modoCadastro
            ? "Já possui uma conta?"
            : "Ainda não possui uma conta?"}{" "}
          <button
            type="button"
            onClick={() => alternarModo(!modoCadastro)}
            className="font-semibold hover:underline"
            style={{ color: "var(--color-primary)" }}
          >
            {modoCadastro ? "Entrar" : "Cadastre-se"}
          </button>
        </p>

        <p
          className="mt-4 text-center text-xs"
          style={{ color: "var(--color-text-muted)" }}
        >
          POS & E-commerce — Sistema de gerenciamento
        </p>
      </div>
    </main>
  );
}
