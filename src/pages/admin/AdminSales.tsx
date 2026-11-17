import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Receipt,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  CalendarDays,
  CreditCard,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import { getSales } from "../../services/salesService";
import type { Sale } from "../../services/salesService";

export default function AdminSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState("");
  const [expandedSales, setExpandedSales] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadSales(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await getSales();
      setSales(data);
    } catch {
      setError(
        "Não foi possível carregar as vendas. Verifique sua conexão e tente novamente.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadSales();
  }, []);

  const filteredSales = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return sales;

    return sales.filter((sale) => {
      const paymentMethods =
        sale.payments?.map((payment) => payment.method).join(" ") ?? "";

      const productNames =
        sale.items
          ?.map((item) => item.product?.name ?? `Produto ${item.productId}`)
          .join(" ") ?? "";

      return (
        String(sale.id).includes(term) ||
        paymentMethods.toLowerCase().includes(term) ||
        productNames.toLowerCase().includes(term)
      );
    });
  }, [sales, search]);

  const totalRevenue = useMemo(
    () => filteredSales.reduce((total, sale) => total + Number(sale.total), 0),
    [filteredSales],
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });

  const paymentLabel = (method: string) => {
    const labels: Record<string, string> = {
      DINHEIRO: "Dinheiro",
      TARJETA: "Cartão",
      PIX: "PIX",
      QR: "QR Code",
    };

    return labels[method] ?? method;
  };

  const paymentStatus = (status?: string) => {
    if (status === "COMPLETO") return "Concluído";
    if (status === "PENDENTE") return "Pendente";
    if (status === "FALHOU") return "Falhou";
    return "Sem informação";
  };

  function toggleSale(id: number) {
    setExpandedSales((current) =>
      current.includes(id)
        ? current.filter((saleId) => saleId !== id)
        : [...current, id],
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <LoaderCircle className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black">Gerenciamento de vendas</h2>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            Consulte todas as vendas realizadas na loja.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadSales(true)}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
          Atualizar vendas
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">
          <AlertCircle size={20} />
          {error}
          <button
            type="button"
            onClick={() => loadSales()}
            className="ml-auto font-bold underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <article
          className="rounded-2xl border p-5 shadow-sm"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                Vendas encontradas
              </p>
              <h3 className="mt-2 text-3xl font-black">
                {filteredSales.length}
              </h3>
            </div>
            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600">
              <ShoppingBag size={24} />
            </div>
          </div>
        </article>

        <article
          className="rounded-2xl border p-5 shadow-sm"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                Total das vendas exibidas
              </p>
              <h3 className="mt-2 text-3xl font-black text-emerald-600">
                {formatCurrency(totalRevenue)}
              </h3>
            </div>
            <div className="rounded-xl bg-amber-500/10 p-3 text-amber-600">
              <Receipt size={24} />
            </div>
          </div>
        </article>
      </div>

      <section
        className="overflow-hidden rounded-2xl border shadow-sm"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <div
          className="border-b p-5"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: "var(--color-text-muted)" }}
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pesquisar por venda, produto ou pagamento..."
              className="w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500"
              style={{
                backgroundColor: "var(--color-bg)",
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
              }}
            />
          </div>
        </div>

        {filteredSales.length === 0 ? (
          <div className="p-10 text-center">
            <Receipt
              size={38}
              className="mx-auto"
              style={{ color: "var(--color-text-muted)" }}
            />
            <p className="mt-3 font-semibold">Nenhuma venda encontrada.</p>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--color-text-muted)" }}
            >
              Tente modificar sua pesquisa.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead
                style={{
                  backgroundColor: "var(--color-surface-muted)",
                  color: "var(--color-text-muted)",
                }}
              >
                <tr>
                  <th className="px-5 py-4">Venda</th>
                  <th className="px-5 py-4">Data</th>
                  <th className="px-5 py-4">Pagamento</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4 text-right">Detalhes</th>
                </tr>
              </thead>

              <tbody>
                {filteredSales.map((sale) => {
                  const expanded = expandedSales.includes(sale.id);
                  const payment = sale.payments?.[0];

                  return (
                    <>
                      <tr
                        key={sale.id}
                        className="border-t transition hover:bg-emerald-500/5"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        <td className="px-5 py-4 font-bold">#{sale.id}</td>

                        <td className="px-5 py-4">
                          <span className="flex items-center gap-2">
                            <CalendarDays
                              size={16}
                              style={{ color: "var(--color-text-muted)" }}
                            />
                            {formatDate(sale.createdAt)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="flex items-center gap-2">
                            <CreditCard
                              size={16}
                              style={{ color: "var(--color-text-muted)" }}
                            />
                            {paymentLabel(payment?.method ?? "Não informado")}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600">
                            {paymentStatus(payment?.status)}
                          </span>
                        </td>

                        <td className="px-5 py-4 font-black text-emerald-600">
                          {formatCurrency(Number(sale.total))}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => toggleSale(sale.id)}
                            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 font-semibold transition hover:bg-emerald-500/10"
                          >
                            {expanded ? "Fechar" : "Ver itens"}
                            {expanded ? (
                              <ChevronUp size={17} />
                            ) : (
                              <ChevronDown size={17} />
                            )}
                          </button>
                        </td>
                      </tr>

                      {expanded && (
                        <tr
                          key={`${sale.id}-details`}
                          style={{ backgroundColor: "var(--color-bg)" }}
                        >
                          <td colSpan={6} className="px-5 py-5">
                            <div
                              className="rounded-xl border p-4"
                              style={{
                                backgroundColor: "var(--color-surface)",
                                borderColor: "var(--color-border)",
                              }}
                            >
                              <div className="mb-4 flex flex-wrap justify-between gap-2">
                                <h4 className="font-bold">
                                  Produtos da venda #{sale.id}
                                </h4>
                                <span
                                  className="text-xs"
                                  style={{ color: "var(--color-text-muted)" }}
                                >
                                  Caixa #{sale.cashRegisterId}
                                </span>
                              </div>

                              {sale.items.length === 0 ? (
                                <p className="text-sm">
                                  Nenhum item registrado.
                                </p>
                              ) : (
                                <div className="space-y-3">
                                  {sale.items.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
                                      style={{
                                        borderColor: "var(--color-border)",
                                      }}
                                    >
                                      <div>
                                        <p className="font-semibold">
                                          {item.product?.name ??
                                            `Produto #${item.productId}`}
                                        </p>
                                        <p
                                          className="mt-1 text-xs"
                                          style={{
                                            color: "var(--color-text-muted)",
                                          }}
                                        >
                                          {item.quantity} unidade(s) ×{" "}
                                          {formatCurrency(
                                            Number(item.unitPrice),
                                          )}
                                        </p>
                                      </div>

                                      <p className="font-bold">
                                        {formatCurrency(Number(item.subtotal))}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {payment && (
                                <div
                                  className="mt-4 flex flex-wrap justify-between gap-2 border-t pt-4 text-sm"
                                  style={{ borderColor: "var(--color-border)" }}
                                >
                                  <span
                                    style={{ color: "var(--color-text-muted)" }}
                                  >
                                    Valor registrado no pagamento
                                  </span>
                                  <strong>
                                    {formatCurrency(Number(payment.amount))}
                                  </strong>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
