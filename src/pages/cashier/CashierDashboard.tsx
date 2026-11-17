import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Wallet,
  LockKeyhole,
  Clock,
  CircleDollarSign,
} from "lucide-react";
import axios from "axios";

import { useAuthStore } from "../../stores/useAuthStore";
import ThemeToggle from "../../components/ThemeToggle";
import CashierSales from "./CashierSales";
import SalesHistory from "./SalesHistory";

import {
  getOpenCashRegister,
  openCashRegister,
  closeCashRegister,
  type CashRegister,
  type CashReconciliation,
} from "../../services/cashRegisterService";

const formatarMoeda = (valor: number | string) =>
  Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

function obterMensagemErro(error: unknown) {
  if (axios.isAxiosError(error)) {
    const mensagem = error.response?.data?.message;

    if (Array.isArray(mensagem)) return mensagem.join(", ");
    if (typeof mensagem === "string") return mensagem;
  }

  return "Não foi possível concluir a operação. Tente novamente.";
}

export default function CashierDashboard() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const [caixa, setCaixa] = useState<CashRegister | null>(null);
  const [valorInicial, setValorInicial] = useState("");
  const [valorFinal, setValorFinal] = useState("");
  const [reconciliation, setReconciliation] =
    useState<CashReconciliation | null>(null);

  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    async function carregarCaixa() {
      try {
        const caixaAtual = await getOpenCashRegister();
        setCaixa(caixaAtual);
      } catch (error) {
        setErro(obterMensagemErro(error));
      } finally {
        setCarregando(false);
      }
    }

    carregarCaixa();
  }, []);

  async function handleAbrirCaixa(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setSucesso("");
    setProcessando(true);

    try {
      const novoCaixa = await openCashRegister(Number(valorInicial));

      setCaixa(novoCaixa);
      setValorInicial("");
      setSucesso("Caixa aberto com sucesso!");
      setReconciliation(null);
    } catch (error) {
      setErro(obterMensagemErro(error));
    } finally {
      setProcessando(false);
    }
  }

  async function handleFecharCaixa(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!caixa) return;

    setErro("");
    setSucesso("");
    setProcessando(true);

    try {
      const resultado = await closeCashRegister(caixa.id, Number(valorFinal));

      setReconciliation(resultado.reconciliation);
      setCaixa(null);
      setValorFinal("");
      setSucesso("Caixa fechado com sucesso!");
    } catch (error) {
      setErro(obterMensagemErro(error));
    } finally {
      setProcessando(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const cardStyle = {
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "16px",
  };

  return (
    <main
      className="min-h-screen p-4 sm:p-6 lg:p-8"
      style={{
        backgroundColor: "var(--color-bg)",
        color: "var(--color-text)",
      }}
    >
      <div className="mx-auto max-w-7xl space-y-8">
        <header
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5 shadow-sm"
          style={{
            backgroundColor: "var(--color-sidebar)",
            color: "#ffffff",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-3">
              <Wallet size={27} className="text-yellow-400" />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-wide">VIBRA STORE</h1>
              <p className="text-sm text-emerald-100">
                Sistema de Ponto de Venda
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{user?.email}</p>
              <p className="text-xs text-emerald-200">Operador de caixa</p>
            </div>

            <ThemeToggle />

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl bg-red-500/15 px-3 py-2.5 text-sm font-medium text-red-100 transition hover:bg-red-500/30"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </header>

        <section>
          <p
            className="text-sm font-medium"
            style={{ color: "var(--color-primary)" }}
          >
            PAINEL DO OPERADOR
          </p>

          <h2 className="mt-1 text-3xl font-bold">Ponto de Venda</h2>

          <p className="mt-2" style={{ color: "var(--color-text-muted)" }}>
            Gerencie a abertura e o fechamento do seu caixa.
          </p>
        </section>

        {erro && (
          <div
            role="alert"
            className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700"
          >
            {erro}
          </div>
        )}

        {sucesso && (
          <div
            role="status"
            className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            {sucesso}
          </div>
        )}

        {carregando ? (
          <div className="rounded-2xl p-8 text-center" style={cardStyle}>
            Consultando situação do caixa...
          </div>
        ) : caixa ? (
          <section className="space-y-6">
            <div
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6"
              style={{
                ...cardStyle,
                borderColor: "var(--color-primary)",
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="rounded-xl p-3"
                  style={{
                    backgroundColor: "var(--color-surface-muted)",
                    color: "var(--color-primary)",
                  }}
                >
                  <Wallet size={30} />
                </div>

                <div>
                  <p
                    className="text-sm"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Situação do caixa
                  </p>
                  <h3 className="text-2xl font-bold">Caixa aberto</h3>
                </div>
              </div>

              <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
                ● EM OPERAÇÃO
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl p-6" style={cardStyle}>
                <div className="flex items-center gap-3">
                  <CircleDollarSign style={{ color: "var(--color-primary)" }} />
                  <p style={{ color: "var(--color-text-muted)" }}>
                    Valor inicial
                  </p>
                </div>

                <p className="mt-4 text-3xl font-bold">
                  {formatarMoeda(caixa.openingAmount)}
                </p>
              </div>

              <div className="rounded-2xl p-6" style={cardStyle}>
                <div className="flex items-center gap-3">
                  <Clock style={{ color: "var(--color-accent)" }} />
                  <p style={{ color: "var(--color-text-muted)" }}>Abertura</p>
                </div>

                <p className="mt-4 text-xl font-bold">
                  {new Date(caixa.openedAt).toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
            <CashierSales cashRegisterId={caixa.id} />

            <div className="rounded-2xl p-6" style={cardStyle}>
              <div className="mb-5 flex items-center gap-3">
                <LockKeyhole
                  size={23}
                  style={{ color: "var(--color-accent)" }}
                />
                <h3 className="text-xl font-bold">Fechamento de caixa</h3>
              </div>

              <p
                className="mb-5 text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                Informe o valor total contado fisicamente no caixa. O sistema
                calculará a reconciliação automaticamente.
              </p>

              <form
                onSubmit={handleFecharCaixa}
                className="flex flex-col gap-4 sm:flex-row sm:items-end"
              >
                <div className="flex-1">
                  <label
                    htmlFor="valorFinal"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Valor contado (R$)
                  </label>

                  <input
                    id="valorFinal"
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={valorFinal}
                    onChange={(event) => setValorFinal(event.target.value)}
                    placeholder="Ex.: 250.00"
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                    style={{
                      backgroundColor: "var(--color-bg)",
                      color: "var(--color-text)",
                      borderColor: "var(--color-border)",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={processando}
                  className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {processando ? "Processando..." : "Fechar caixa"}
                </button>
              </form>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl p-6 sm:p-8" style={cardStyle}>
            <div className="mx-auto max-w-xl text-center">
              <div
                className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: "var(--color-surface-muted)",
                  color: "var(--color-primary)",
                }}
              >
                <Wallet size={34} />
              </div>

              <h3 className="text-2xl font-bold">Nenhum caixa aberto</h3>

              <p className="mt-2" style={{ color: "var(--color-text-muted)" }}>
                Informe o valor inicial em dinheiro para começar suas operações.
              </p>

              <form
                onSubmit={handleAbrirCaixa}
                className="mt-7 space-y-4 text-left"
              >
                <div>
                  <label
                    htmlFor="valorInicial"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Valor inicial do caixa (R$)
                  </label>

                  <input
                    id="valorInicial"
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={valorInicial}
                    onChange={(event) => setValorInicial(event.target.value)}
                    placeholder="Ex.: 100.00"
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                    style={{
                      backgroundColor: "var(--color-bg)",
                      color: "var(--color-text)",
                      borderColor: "var(--color-border)",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={processando}
                  className="w-full rounded-xl px-6 py-3 font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  {processando ? "Abrindo..." : "Abrir meu caixa"}
                </button>
              </form>
            </div>
          </section>
        )}

        {reconciliation && (
          <section
            className="rounded-2xl p-6"
            style={{
              ...cardStyle,
              borderColor: "var(--color-accent)",
            }}
          >
            <h3 className="text-xl font-bold">Resumo da reconciliação</h3>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Valor inicial", reconciliation.openingAmount],
                ["Total de vendas", reconciliation.salesTotal],
                ["Valor esperado", reconciliation.expectedAmount],
                ["Valor contado", reconciliation.closingAmount],
                ["Diferença", reconciliation.difference],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: "var(--color-surface-muted)",
                  }}
                >
                  <p
                    className="text-sm"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {label}
                  </p>
                  <p className="mt-2 text-xl font-bold">
                    {formatarMoeda(Number(value))}
                  </p>
                </div>
              ))}
              <SalesHistory />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
