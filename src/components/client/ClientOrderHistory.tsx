import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock3,
  CreditCard,
  LoaderCircle,
  MapPin,
  Package,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";

import {
  getMyOrders,
  getMyOrder,
  type Order,
  type OrderStatus,
  type PaymentStatus,
} from "../../services/orderService";

import Pagination from "../ui/Pagination";

const PAGE_SIZE = 5;

const ORDER_STATUS: Record<
  OrderStatus,
  { label: string; color: string; background: string }
> = {
  PENDIENTE: {
    label: "Pendente",
    color: "#d97706",
    background: "#fef3c7",
  },
  PAGO: {
    label: "Pago",
    color: "#059669",
    background: "#d1fae5",
  },
  EN_CAMINO: {
    label: "Em caminho",
    color: "#2563eb",
    background: "#dbeafe",
  },
  ENTREGADO: {
    label: "Entregue",
    color: "#059669",
    background: "#d1fae5",
  },
  CANCELADO: {
    label: "Cancelado",
    color: "#dc2626",
    background: "#fee2e2",
  },
};

const PAYMENT_STATUS: Record<PaymentStatus, string> = {
  PENDIENTE: "Pendente",
  COMPLETO: "Completo",
  FRACASADO: "Falhou",
  CANCELADO: "Cancelado",
};

const PAYMENT_METHOD: Record<string, string> = {
  DINERO: "Dinheiro",
  TARJETA: "Cartão",
  PIX: "PIX",
  QR: "QR Code",
};

function formatarPreco(valor: number | string) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(data: string) {
  return new Date(data).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function getOrderProgress(status: OrderStatus) {
  const steps = [
    {
      label: "Pedido realizado",
      description: "Seu pedido foi registrado.",
    },
    {
      label: "Pagamento confirmado",
      description: "O pagamento foi aprovado.",
    },
    {
      label: "Em transporte",
      description: "Seu pedido está a caminho.",
    },
    {
      label: "Entregue",
      description: "Pedido concluído com sucesso.",
    },
  ];

  const progressByStatus: Record<OrderStatus, number> = {
    PENDIENTE: 0,
    PAGO: 1,
    EN_CAMINO: 2,
    ENTREGADO: 3,
    CANCELADO: -1,
  };

  return {
    steps,
    currentStep: progressByStatus[status],
    cancelled: status === "CANCELADO",
  };
}

interface ClientOrderHistoryProps {
  refreshKey?: number;
}

export default function ClientOrderHistory({
  refreshKey = 0,
}: ClientOrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const carregarPedidos = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getMyOrders();

      setOrders(result);
      setCurrentPage(1);
      setExpandedOrderId(null);
      setSelectedOrder(null);
    } catch {
      setError("Não foi possível carregar seu histórico de pedidos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarPedidos();
  }, [carregarPedidos, refreshKey]);
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;

    return orders.slice(startIndex, startIndex + PAGE_SIZE);
  }, [orders, currentPage]);

  async function handleToggleDetails(orderId: number) {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      setSelectedOrder(null);
      return;
    }

    setExpandedOrderId(orderId);
    setSelectedOrder(null);
    setLoadingDetails(true);

    try {
      const result = await getMyOrder(orderId);
      setSelectedOrder(result);
    } catch {
      setError("Não foi possível carregar os detalhes deste pedido.");
      setExpandedOrderId(null);
    } finally {
      setLoadingDetails(false);
    }
  }

  return (
    <section
      className="rounded-2xl border p-5 shadow-sm sm:p-6"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
        color: "var(--color-text)",
      }}
    >
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag size={21} style={{ color: "var(--color-primary)" }} />
            <h2 className="text-xl font-bold">Meus pedidos</h2>
          </div>

          <p
            className="mt-1 text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            Consulte suas compras e acompanhe cada pedido.
          </p>
        </div>

        <button
          type="button"
          onClick={carregarPedidos}
          disabled={loading}
          className="flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition hover:opacity-80 disabled:opacity-50"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-text)",
          }}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Atualizar
        </button>
      </div>

      {error && (
        <div
          className="mb-4 flex items-center gap-2 rounded-xl border p-3 text-sm"
          style={{
            borderColor: "#dc2626",
            color: "#dc2626",
          }}
        >
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-40 items-center justify-center gap-3">
          <LoaderCircle
            size={24}
            className="animate-spin"
            style={{ color: "var(--color-primary)" }}
          />
          <span
            className="text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            Carregando seus pedidos...
          </span>
        </div>
      ) : orders.length === 0 ? (
        <div
          className="rounded-xl border border-dashed px-5 py-12 text-center"
          style={{ borderColor: "var(--color-border)" }}
        >
          <Package
            size={42}
            className="mx-auto mb-3"
            style={{ color: "var(--color-text-muted)" }}
          />

          <h3 className="font-semibold">Você ainda não tem pedidos</h3>

          <p
            className="mt-1 text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            Quando finalizar uma compra, ela aparecerá aqui.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedOrders.map((order) => {
              const status = ORDER_STATUS[order.status];
              const isExpanded = expandedOrderId === order.id;

              const payment = order.payments?.[0];

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-xl border"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold">Pedido #{order.id}</span>

                          <span
                            className="rounded-full px-3 py-1 text-xs font-bold"
                            style={{
                              color: status.color,
                              backgroundColor: status.background,
                            }}
                          >
                            {status.label}
                          </span>
                        </div>

                        <div
                          className="flex flex-wrap gap-x-4 gap-y-2 text-xs sm:text-sm"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          <span className="flex items-center gap-1.5">
                            <CalendarDays size={15} />
                            {formatarData(order.createdAt)}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Package size={15} />
                            {order.items.length} produto(s)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <div className="sm:text-right">
                          <p
                            className="text-xs"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            Total do pedido
                          </p>

                          <p
                            className="text-xl font-bold"
                            style={{ color: "var(--color-primary)" }}
                          >
                            {formatarPreco(order.total)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleDetails(order.id)}
                          disabled={loadingDetails}
                          className="flex h-10 items-center gap-1 rounded-lg border px-3 text-sm font-semibold transition hover:opacity-80"
                          style={{
                            borderColor: "var(--color-border)",
                            color: "var(--color-text)",
                          }}
                        >
                          <span className="hidden sm:inline">
                            {isExpanded ? "Fechar" : "Detalhes"}
                          </span>
                          {isExpanded ? (
                            <ChevronUp size={17} />
                          ) : (
                            <ChevronDown size={17} />
                          )}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div
                        className="mt-5 space-y-5 border-t pt-5"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        {loadingDetails ? (
                          <div className="flex items-center gap-2 py-5 text-sm">
                            <LoaderCircle
                              size={19}
                              className="animate-spin"
                              style={{ color: "var(--color-primary)" }}
                            />
                            Carregando detalhes...
                          </div>
                        ) : selectedOrder?.id === order.id ? (
                          <>
                            {(() => {
                              const progress = getOrderProgress(
                                selectedOrder.status,
                              );

                              return (
                                <div>
                                  <h4 className="mb-4 text-sm font-bold">
                                    Acompanhamento do pedido
                                  </h4>

                                  {progress.cancelled ? (
                                    <div
                                      className="rounded-xl border p-4"
                                      style={{
                                        borderColor: "#dc2626",
                                        backgroundColor: "#fef2f2",
                                        color: "#dc2626",
                                      }}
                                    >
                                      <p className="font-bold">
                                        Pedido cancelado
                                      </p>
                                      <p className="mt-1 text-sm">
                                        Este pedido foi cancelado e não seguirá
                                        para as próximas etapas.
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="space-y-4">
                                      {progress.steps.map((step, index) => {
                                        const completed =
                                          index <= progress.currentStep;
                                        const current =
                                          index === progress.currentStep;

                                        return (
                                          <div
                                            key={step.label}
                                            className="flex gap-3"
                                          >
                                            <div
                                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                                              style={{
                                                backgroundColor: completed
                                                  ? "var(--color-primary)"
                                                  : "var(--color-surface-muted)",
                                                color: completed
                                                  ? "#ffffff"
                                                  : "var(--color-text-muted)",
                                              }}
                                            >
                                              {completed ? "✓" : index + 1}
                                            </div>

                                            <div>
                                              <p
                                                className="text-sm font-semibold"
                                                style={{
                                                  color: completed
                                                    ? "var(--color-primary)"
                                                    : "var(--color-text-muted)",
                                                }}
                                              >
                                                {step.label}
                                                {current ? " (atual)" : ""}
                                              </p>

                                              <p
                                                className="text-xs"
                                                style={{
                                                  color:
                                                    "var(--color-text-muted)",
                                                }}
                                              >
                                                {step.description}
                                              </p>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}

                            <div>
                              <h4 className="mb-3 flex items-center gap-2 text-sm font-bold">
                                <Package
                                  size={17}
                                  style={{ color: "var(--color-primary)" }}
                                />
                                Produtos do pedido
                              </h4>

                              <div className="space-y-2">
                                {selectedOrder.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex flex-col justify-between gap-2 rounded-lg p-3 sm:flex-row sm:items-center"
                                    style={{
                                      backgroundColor:
                                        "var(--color-surface-muted)",
                                    }}
                                  >
                                    <div>
                                      <p className="text-sm font-semibold">
                                        {item.product?.name ||
                                          `Produto #${item.productId}`}
                                      </p>

                                      <p
                                        className="text-xs"
                                        style={{
                                          color: "var(--color-text-muted)",
                                        }}
                                      >
                                        {item.quantity} unidade(s) ×{" "}
                                        {formatarPreco(item.unitPrice)}
                                      </p>
                                    </div>

                                    <p className="text-sm font-bold">
                                      {formatarPreco(item.subtotal)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <h4 className="mb-2 flex items-center gap-2 text-sm font-bold">
                                  <MapPin
                                    size={17}
                                    style={{
                                      color: "var(--color-primary)",
                                    }}
                                  />
                                  Endereço de entrega
                                </h4>

                                <div
                                  className="rounded-lg p-3 text-sm"
                                  style={{
                                    backgroundColor:
                                      "var(--color-surface-muted)",
                                  }}
                                >
                                  <p className="font-semibold">
                                    {selectedOrder.shippingStreet},{" "}
                                    {selectedOrder.shippingNumber}
                                  </p>

                                  {selectedOrder.shippingComplement && (
                                    <p
                                      className="mt-1 text-xs"
                                      style={{
                                        color: "var(--color-text-muted)",
                                      }}
                                    >
                                      {selectedOrder.shippingComplement}
                                    </p>
                                  )}

                                  <p
                                    className="mt-1"
                                    style={{
                                      color: "var(--color-text-muted)",
                                    }}
                                  >
                                    {selectedOrder.shippingCity}
                                  </p>

                                  {selectedOrder.shippingReference && (
                                    <p
                                      className="mt-1 text-xs"
                                      style={{
                                        color: "var(--color-text-muted)",
                                      }}
                                    >
                                      Referência:{" "}
                                      {selectedOrder.shippingReference}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div>
                                <h4 className="mb-2 flex items-center gap-2 text-sm font-bold">
                                  <CreditCard
                                    size={17}
                                    style={{
                                      color: "var(--color-primary)",
                                    }}
                                  />
                                  Pagamento
                                </h4>

                                <div
                                  className="rounded-lg p-3 text-sm"
                                  style={{
                                    backgroundColor:
                                      "var(--color-surface-muted)",
                                  }}
                                >
                                  {selectedOrder.payments?.length ? (
                                    selectedOrder.payments.map((item) => (
                                      <div
                                        key={item.id}
                                        className="flex flex-wrap justify-between gap-2"
                                      >
                                        <div>
                                          <p className="font-semibold">
                                            {PAYMENT_METHOD[item.method] ||
                                              item.method}
                                          </p>

                                          <p
                                            className="mt-1 text-xs"
                                            style={{
                                              color: "var(--color-text-muted)",
                                            }}
                                          >
                                            Status:{" "}
                                            {PAYMENT_STATUS[item.status]}
                                          </p>
                                        </div>

                                        <p className="font-bold">
                                          {formatarPreco(item.amount)}
                                        </p>
                                      </div>
                                    ))
                                  ) : (
                                    <p
                                      style={{
                                        color: "var(--color-text-muted)",
                                      }}
                                    >
                                      Nenhum pagamento registrado.
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div
                              className="flex flex-wrap items-center justify-between gap-3 border-t pt-4"
                              style={{ borderColor: "var(--color-border)" }}
                            >
                              <span
                                className="flex items-center gap-2 text-sm"
                                style={{
                                  color: "var(--color-text-muted)",
                                }}
                              >
                                <Clock3 size={16} />
                                Situação do pedido: {status.label}
                              </span>

                              <span className="text-lg font-bold">
                                Total: {formatarPreco(selectedOrder.total)}
                              </span>
                            </div>
                          </>
                        ) : null}
                      </div>
                    )}

                    {payment && !isExpanded && (
                      <div
                        className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 text-xs"
                        style={{
                          borderColor: "var(--color-border)",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        <span>Pagamento: {PAYMENT_STATUS[payment.status]}</span>

                        <span>
                          Método:{" "}
                          {PAYMENT_METHOD[payment.method] || payment.method}
                        </span>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-5">
            <Pagination
              currentPage={currentPage}
              totalItems={orders.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}
    </section>
  );
}
