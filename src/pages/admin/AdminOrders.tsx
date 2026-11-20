import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  RefreshCw,
  Eye,
  X,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  LoaderCircle,
  ShoppingBag,
  Store,
} from "lucide-react";

import Pagination from "../../components/ui/Pagination";
import {
  getOrders,
  getOrder,
  updateOrderStatus,
  type Order,
  type OrderStatus,
  type OrderSource,
} from "../../services/orderService";

const PAGE_SIZE = 5;

const statusLabels: Record<OrderStatus, string> = {
  PENDIENTE: "Pendente",
  PAGO: "Pago",
  EN_CAMINO: "Em transporte",
  ENTREGADO: "Entregue",
  CANCELADO: "Cancelado",
};

const statusStyles: Record<OrderStatus, string> = {
  PENDIENTE: "bg-amber-500/10 text-amber-600",
  PAGO: "bg-blue-500/10 text-blue-600",
  EN_CAMINO: "bg-violet-500/10 text-violet-600",
  ENTREGADO: "bg-emerald-500/10 text-emerald-600",
  CANCELADO: "bg-red-500/10 text-red-600",
};

const statusIcons: Record<OrderStatus, typeof Clock> = {
  PENDIENTE: Clock,
  PAGO: CheckCircle,
  EN_CAMINO: Truck,
  ENTREGADO: Package,
  CANCELADO: XCircle,
};

const statusOptions: OrderStatus[] = [
  "PENDIENTE",
  "PAGO",
  "EN_CAMINO",
  "ENTREGADO",
  "CANCELADO",
];

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("pt-BR");
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;

    if (Array.isArray(message)) {
      return message.join(", ");
    }

    if (typeof message === "string") {
      return message;
    }
  }

  return "Não foi possível concluir a operação. Tente novamente.";
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [sourceFilter, setSourceFilter] = useState("TODOS");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadOrders(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();

    return orders.filter((order) => {
      const customerName = order.customer?.user?.name ?? "";
      const customerEmail = order.customer?.user?.email ?? "";

      const matchesSearch =
        !term ||
        String(order.id).includes(term) ||
        customerName.toLowerCase().includes(term) ||
        customerEmail.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "TODOS" || order.status === statusFilter;

      const matchesSource =
        sourceFilter === "TODOS" || order.source === sourceFilter;

      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [orders, search, statusFilter, sourceFilter]);

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const metrics = useMemo(
    () => [
      {
        label: "Total de pedidos",
        value: orders.length,
        icon: ShoppingBag,
        color: "text-emerald-600",
        bg: "bg-emerald-500/10",
      },
      {
        label: "Aguardando pagamento",
        value: orders.filter((order) => order.status === "PENDIENTE").length,
        icon: Clock,
        color: "text-amber-600",
        bg: "bg-amber-500/10",
      },
      {
        label: "Em transporte",
        value: orders.filter((order) => order.status === "EN_CAMINO").length,
        icon: Truck,
        color: "text-violet-600",
        bg: "bg-violet-500/10",
      },
      {
        label: "Entregues",
        value: orders.filter((order) => order.status === "ENTREGADO").length,
        icon: CheckCircle,
        color: "text-emerald-600",
        bg: "bg-emerald-500/10",
      },
    ],
    [orders],
  );

  async function openDetails(order: Order) {
    try {
      setSelectedOrder(order);
      setActionError("");
      setLoadingDetails(true);

      const details = await getOrder(order.id);
      setSelectedOrder(details);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setLoadingDetails(false);
    }
  }

  async function handleStatusChange(order: Order, newStatus: OrderStatus) {
    if (order.status === newStatus) return;

    if (
      newStatus === "CANCELADO" &&
      !window.confirm(
        `Deseja realmente cancelar o pedido #${order.id}?\n\nO estoque será restaurado e os pagamentos serão cancelados.`,
      )
    ) {
      return;
    }

    try {
      setUpdatingId(order.id);
      setActionError("");
      setSuccess("");

      const updatedOrder = await updateOrderStatus(order.id, newStatus);

      setOrders((previous) =>
        previous.map((item) =>
          item.id === updatedOrder.id ? { ...item, ...updatedOrder } : item,
        ),
      );

      setSelectedOrder((previous) =>
        previous?.id === updatedOrder.id ? updatedOrder : previous,
      );

      setSuccess(
        `Pedido #${order.id} atualizado para ${statusLabels[newStatus]}.`,
      );
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  }

  function canUpdateStatus(status: OrderStatus) {
    return status !== "CANCELADO" && status !== "ENTREGADO";
  }

  const formatSource = (source: OrderSource) =>
    source === "WEB" ? "Loja online" : "Redes sociais";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold">Gerenciamento de pedidos</h2>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            Acompanhe pedidos, clientes, pagamentos e entregas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadOrders(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:bg-emerald-500/10 disabled:opacity-50"
          style={{ borderColor: "var(--color-border)" }}
        >
          {refreshing ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <RefreshCw size={17} />
          )}
          Atualizar
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-600">
          {success}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article
              key={metric.label}
              className="rounded-2xl border p-5 shadow-sm"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-xl p-3 ${metric.bg} ${metric.color}`}>
                  <Icon size={22} />
                </div>
              </div>

              <p
                className="mt-4 text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                {metric.label}
              </p>
              <h3 className="mt-1 text-3xl font-black">{metric.value}</h3>
            </article>
          );
        })}
      </div>

      <section
        className="overflow-hidden rounded-2xl border shadow-sm"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <div
          className="flex flex-col gap-3 border-b p-5 lg:flex-row"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--color-text-muted)" }}
            />
            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por pedido, cliente ou e-mail..."
              className="w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500"
              style={{
                backgroundColor: "var(--color-bg)",
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border px-3 py-3 text-sm outline-none"
            style={{
              backgroundColor: "var(--color-bg)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          >
            <option value="TODOS">Todos os status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>

          <select
            value={sourceFilter}
            onChange={(event) => {
              setSourceFilter(event.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border px-3 py-3 text-sm outline-none"
            style={{
              backgroundColor: "var(--color-bg)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          >
            <option value="TODOS">Todas as origens</option>
            <option value="WEB">Loja online</option>
            <option value="SOCIAL">Redes sociais</option>
          </select>
        </div>

        {loading ? (
          <div
            className="flex items-center justify-center gap-3 p-12 text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            <LoaderCircle size={20} className="animate-spin" />
            Carregando pedidos...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package
              size={38}
              className="mx-auto"
              style={{ color: "var(--color-text-muted)" }}
            />
            <h3 className="mt-4 font-bold">Nenhum pedido encontrado</h3>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--color-text-muted)" }}
            >
              Tente alterar os filtros ou a pesquisa.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-212.5 text-left text-sm">
                <thead>
                  <tr
                    className="border-b text-xs uppercase"
                    style={{
                      borderColor: "var(--color-border)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    <th className="px-5 py-4">Pedido</th>
                    <th className="px-5 py-4">Cliente</th>
                    <th className="px-5 py-4">Origem</th>
                    <th className="px-5 py-4">Data</th>
                    <th className="px-5 py-4">Total</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Detalhes</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedOrders.map((order) => {
                    const StatusIcon = statusIcons[order.status];

                    return (
                      <tr
                        key={order.id}
                        className="border-b last:border-0"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        <td className="px-5 py-4 font-bold">#{order.id}</td>
                        <td className="px-5 py-4">
                          <p className="font-semibold">
                            {order.customer?.user?.name ??
                              `Cliente #${order.customerId}`}
                          </p>
                          <p
                            className="mt-1 text-xs"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            {order.customer?.user?.email ??
                              "E-mail não disponível"}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-2">
                            {order.source === "WEB" ? (
                              <ShoppingBag size={16} />
                            ) : (
                              <Store size={16} />
                            )}
                            {formatSource(order.source)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-5 py-4 font-bold text-emerald-600">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${statusStyles[order.status]}`}
                          >
                            <StatusIcon size={14} />
                            {statusLabels[order.status]}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => void openDetails(order)}
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 font-semibold text-emerald-600 transition hover:bg-emerald-500/20"
                          >
                            <Eye size={16} />
                            Ver
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div
              className="border-t p-4"
              style={{ borderColor: "var(--color-border)" }}
            >
              <Pagination
                currentPage={currentPage}
                totalItems={filteredOrders.length}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </section>

      {selectedOrder && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 p-4">
          <section
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border shadow-2xl"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          >
            <header
              className="sticky top-0 flex items-center justify-between border-b p-5"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
              }}
            >
              <div>
                <h3 className="text-xl font-black">
                  Pedido #{selectedOrder.id}
                </h3>
                <p
                  className="mt-1 text-xs"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Criado em {formatDate(selectedOrder.createdAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedOrder(null);
                  setActionError("");
                }}
                className="rounded-lg p-2 transition hover:bg-black/5"
                aria-label="Fechar detalhes"
              >
                <X size={21} />
              </button>
            </header>

            <div className="space-y-6 p-5">
              {actionError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">
                  {actionError}
                </div>
              )}

              {loadingDetails ? (
                <div
                  className="flex items-center justify-center gap-3 p-8 text-sm"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  <LoaderCircle size={20} className="animate-spin" />
                  Carregando detalhes...
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div
                      className="rounded-xl border p-4"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <p
                        className="text-xs font-bold uppercase"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        Cliente
                      </p>
                      <p className="mt-2 font-bold">
                        {selectedOrder.customer?.user?.name ??
                          `Cliente #${selectedOrder.customerId}`}
                      </p>
                      <p className="mt-1 text-sm">
                        {selectedOrder.customer?.user?.email ??
                          "E-mail não disponível"}
                      </p>
                      <p className="mt-1 text-sm">
                        Telefone:{" "}
                        {selectedOrder.customer?.phone ?? "Não informado"}
                      </p>
                      <p className="mt-1 text-sm">
                        Documento:{" "}
                        {selectedOrder.customer?.document ?? "Não informado"}
                      </p>
                    </div>

                    <div
                      className="rounded-xl border p-4"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <p
                        className="text-xs font-bold uppercase"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        Entrega
                      </p>
                      <p className="mt-2 font-semibold">
                        {selectedOrder.shippingStreet},{" "}
                        {selectedOrder.shippingNumber}
                      </p>
                      {selectedOrder.shippingComplement && (
                        <p className="mt-1 text-sm">
                          {selectedOrder.shippingComplement}
                        </p>
                      )}
                      <p className="mt-1 text-sm">
                        {selectedOrder.shippingCity}
                      </p>
                      {selectedOrder.shippingReference && (
                        <p className="mt-1 text-sm">
                          Referência: {selectedOrder.shippingReference}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 font-bold">Produtos do pedido</h4>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-4 rounded-xl border p-3"
                          style={{ borderColor: "var(--color-border)" }}
                        >
                          <div>
                            <p className="font-semibold">
                              {item.product?.name ??
                                `Produto #${item.productId}`}
                            </p>
                            <p
                              className="mt-1 text-xs"
                              style={{ color: "var(--color-text-muted)" }}
                            >
                              {item.quantity} × {formatCurrency(item.unitPrice)}
                            </p>
                          </div>
                          <p className="shrink-0 font-bold">
                            {formatCurrency(item.subtotal)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className="rounded-xl border p-4"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <h4 className="font-bold">Pagamento</h4>
                    {selectedOrder.payments?.length ? (
                      <div className="mt-3 space-y-3">
                        {selectedOrder.payments.map((payment) => (
                          <div
                            key={payment.id}
                            className="flex flex-wrap justify-between gap-2 text-sm"
                          >
                            <span>
                              {payment.method} · {payment.status}
                            </span>
                            <strong>{formatCurrency(payment.amount)}</strong>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p
                        className="mt-2 text-sm"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        Nenhum pagamento registrado.
                      </p>
                    )}
                    <div
                      className="mt-4 flex justify-between border-t pt-3"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <span className="font-bold">Total do pedido</span>
                      <strong className="text-lg text-emerald-600">
                        {formatCurrency(selectedOrder.total)}
                      </strong>
                    </div>
                  </div>

                  <div
                    className="rounded-xl border p-4"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <label className="mb-2 block text-sm font-bold">
                      Atualizar status do pedido
                    </label>

                    {canUpdateStatus(selectedOrder.status) ? (
                      <select
                        value={selectedOrder.status}
                        disabled={updatingId === selectedOrder.id}
                        onChange={(event) =>
                          void handleStatusChange(
                            selectedOrder,
                            event.target.value as OrderStatus,
                          )
                        }
                        className="w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-emerald-500 disabled:opacity-50"
                        style={{
                          backgroundColor: "var(--color-bg)",
                          borderColor: "var(--color-border)",
                          color: "var(--color-text)",
                        }}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {statusLabels[status]}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        Este pedido está{" "}
                        {statusLabels[selectedOrder.status].toLowerCase()} e não
                        pode mais ser alterado.
                      </p>
                    )}

                    {updatingId === selectedOrder.id && (
                      <p className="mt-2 flex items-center gap-2 text-xs text-emerald-600">
                        <LoaderCircle size={14} className="animate-spin" />
                        Atualizando pedido...
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
