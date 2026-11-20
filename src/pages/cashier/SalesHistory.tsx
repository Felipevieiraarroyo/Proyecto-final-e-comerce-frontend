import { useEffect, useMemo, useState } from "react";
import {
  History,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ReceiptText,
} from "lucide-react";
import axios from "axios";

import { getSales, type Sale } from "../../services/salesService";
import Pagination from "../../components/ui/Pagination";

const formatarMoeda = (valor: number | string) =>
  Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const formatarData = (data: string) => new Date(data).toLocaleString("pt-BR");

const obterMetodoPagamento = (metodo: string) => {
  const metodos: Record<string, string> = {
    DINERO: "Dinheiro",
    TARJETA: "Cartão",
    PIX: "PIX",
    QR: "QR Code",
  };

  return metodos[metodo] ?? metodo;
};

function obterMensagemErro(error: unknown) {
  if (axios.isAxiosError(error)) {
    const mensagem = error.response?.data?.message;

    if (Array.isArray(mensagem)) return mensagem.join(", ");
    if (typeof mensagem === "string") return mensagem;
  }

  return "Não foi possível carregar o histórico de vendas.";
}

export default function SalesHistory() {
  const [vendas, setVendas] = useState<Sale[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [vendaExpandida, setVendaExpandida] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  async function carregarVendas() {
    setCarregando(true);
    setErro("");

    try {
      const resultado = await getSales();
      setVendas(resultado);
    } catch (error) {
      setErro(obterMensagemErro(error));
    } finally {
      setCarregando(false);
    }
  }
  const vendasPaginadas = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;

    return vendas.slice(startIndex, startIndex + pageSize);
  }, [vendas, currentPage]);

  useEffect(() => {
    carregarVendas();
  }, []);

  function alternarDetalhes(id: number) {
    setVendaExpandida((atual) => (atual === id ? null : id));
  }

  const cardStyle = {
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "16px",
  };

  return (
    <section className="space-y-5 rounded-2xl p-6" style={cardStyle}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="rounded-xl p-3"
            style={{
              backgroundColor: "var(--color-surface-muted)",
              color: "var(--color-primary)",
            }}
          >
            <History size={24} />
          </div>

          <div>
            <h3 className="text-xl font-bold">Histórico de vendas</h3>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--color-text-muted)" }}
            >
              Consulte suas vendas e os respectivos pagamentos.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={carregarVendas}
          disabled={carregando}
          className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:opacity-80 disabled:opacity-50"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-text)",
          }}
        >
          <RefreshCw size={17} className={carregando ? "animate-spin" : ""} />
          Atualizar
        </button>
      </div>

      {erro && (
        <div
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700"
        >
          {erro}
        </div>
      )}

      {carregando ? (
        <div
          className="rounded-xl p-8 text-center"
          style={{
            backgroundColor: "var(--color-surface-muted)",
            color: "var(--color-text-muted)",
          }}
        >
          Carregando histórico de vendas...
        </div>
      ) : vendas.length === 0 ? (
        <div
          className="rounded-xl p-8 text-center"
          style={{
            backgroundColor: "var(--color-surface-muted)",
            color: "var(--color-text-muted)",
          }}
        >
          <ReceiptText size={34} className="mx-auto mb-3" />
          <p className="font-semibold">Nenhuma venda encontrada</p>
          <p className="mt-1 text-sm">As vendas realizadas aparecerão aqui.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            {vendas.length}{" "}
            {vendas.length === 1 ? "venda registrada" : "vendas registradas"}
          </p>

          {vendasPaginadas.map((venda) => {
            const expandida = vendaExpandida === venda.id;

            return (
              <div
                key={venda.id}
                className="overflow-hidden rounded-xl border"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="flex flex-wrap items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-lg p-2.5"
                      style={{
                        backgroundColor: "var(--color-surface-muted)",
                        color: "var(--color-primary)",
                      }}
                    >
                      <ReceiptText size={21} />
                    </div>

                    <div>
                      <p className="font-bold">Venda #{venda.id}</p>
                      <p
                        className="mt-1 text-xs"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {formatarData(venda.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="text-right">
                      <p
                        className="text-xs"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        Total
                      </p>
                      <p
                        className="text-lg font-bold"
                        style={{ color: "var(--color-primary)" }}
                      >
                        {formatarMoeda(venda.total)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => alternarDetalhes(venda.id)}
                      className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition hover:opacity-75"
                      style={{
                        backgroundColor: "var(--color-surface-muted)",
                        color: "var(--color-text)",
                      }}
                    >
                      {expandida ? "Ocultar" : "Detalhes"}
                      {expandida ? (
                        <ChevronUp size={17} />
                      ) : (
                        <ChevronDown size={17} />
                      )}
                    </button>
                  </div>
                </div>

                {expandida && (
                  <div
                    className="space-y-4 border-t p-4"
                    style={{
                      borderColor: "var(--color-border)",
                      backgroundColor: "var(--color-bg)",
                    }}
                  >
                    <div>
                      <h4 className="mb-3 font-semibold">Produtos da venda</h4>

                      <div className="space-y-3">
                        {venda.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-wrap justify-between gap-2 text-sm"
                          >
                            <div>
                              <p className="font-medium">
                                {item.product?.name ??
                                  `Produto #${item.productId}`}
                              </p>
                              <p
                                className="text-xs"
                                style={{ color: "var(--color-text-muted)" }}
                              >
                                {item.quantity} ×{" "}
                                {formatarMoeda(item.unitPrice)}
                              </p>
                            </div>

                            <p className="font-semibold">
                              {formatarMoeda(item.subtotal)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div
                      className="border-t pt-3"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <h4 className="mb-2 font-semibold">Pagamento</h4>

                      {venda.payments?.length ? (
                        venda.payments.map((pagamento) => (
                          <div
                            key={pagamento.id}
                            className="flex flex-wrap justify-between gap-2 text-sm"
                          >
                            <div>
                              <p>{obterMetodoPagamento(pagamento.method)}</p>
                              <p
                                className="text-xs"
                                style={{ color: "var(--color-text-muted)" }}
                              >
                                Status: {pagamento.status}
                              </p>
                            </div>

                            <p className="font-semibold">
                              {formatarMoeda(pagamento.amount)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p
                          className="text-sm"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          Informações de pagamento indisponíveis.
                        </p>
                      )}
                    </div>

                    <div
                      className="flex flex-wrap justify-between gap-2 border-t pt-3 text-sm"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <span style={{ color: "var(--color-text-muted)" }}>
                        Caixa #{venda.cashRegisterId}
                      </span>
                      <span className="font-bold">
                        Total: {formatarMoeda(venda.total)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <Pagination
            currentPage={currentPage}
            totalItems={vendas.length}
            pageSize={pageSize}
            onPageChange={(page) => {
              setCurrentPage(page);
              setVendaExpandida(null);
            }}
          />
        </div>
      )}
    </section>
  );
}
