import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  LoaderCircle,
  Package,
} from "lucide-react";

import { getProducts } from "../../services/productService";
import { createSale, type PaymentMethod } from "../../services/salesService";
import type { Product } from "../../types/product";
import Pagination from "../../components/ui/Pagination";

interface CashierSalesProps {
  cashRegisterId: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

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

const cardStyle = {
  backgroundColor: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "16px",
};

export default function CashierSales({ cashRegisterId }: CashierSalesProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [busca, setBusca] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");

  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function carregarProdutos() {
    try {
      setErro("");
      const dados = await getProducts();
      setProducts(dados);
    } catch (error) {
      setErro(obterMensagemErro(error));
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return products.filter((product) => {
      const correspondeBusca =
        product.name.toLowerCase().includes(termo) ||
        product.category?.name.toLowerCase().includes(termo);

      const possuiEstoque = (product.inventory?.quantity ?? 0) > 0;

      return correspondeBusca && possuiEstoque;
    });
  }, [products, busca]);
  useEffect(() => {
    setCurrentPage(1);
  }, [busca]);

  const produtosPaginados = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;

    return produtosFiltrados.slice(startIndex, startIndex + pageSize);
  }, [produtosFiltrados, currentPage]);

  const total = useMemo(
    () =>
      Math.round(
        cart.reduce(
          (soma, item) => soma + Number(item.product.salePrice) * item.quantity,
          0,
        ) * 100,
      ) / 100,
    [cart],
  );

  function adicionarProduto(product: Product) {
    setErro("");
    setSucesso("");

    const estoqueDisponivel = product.inventory?.quantity ?? 0;

    setCart((atual) => {
      const existente = atual.find((item) => item.product.id === product.id);

      if (existente) {
        if (existente.quantity >= estoqueDisponivel) {
          setErro("Quantidade máxima disponível em estoque atingida.");
          return atual;
        }

        return atual.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...atual, { product, quantity: 1 }];
    });
  }

  function alterarQuantidade(productId: number, variacao: number) {
    setErro("");
    setSucesso("");

    setCart((atual) =>
      atual
        .map((item) => {
          if (item.product.id !== productId) return item;

          const novaQuantidade = item.quantity + variacao;
          const estoqueDisponivel = item.product.inventory?.quantity ?? 0;

          if (novaQuantidade > estoqueDisponivel) {
            setErro("Não há estoque suficiente para essa quantidade.");
            return item;
          }

          return { ...item, quantity: novaQuantidade };
        })
        .filter((item) => item.quantity > 0),
    );
  }

  function removerProduto(productId: number) {
    setCart((atual) => atual.filter((item) => item.product.id !== productId));
  }

  async function finalizarVenda() {
    if (cart.length === 0) {
      setErro("Adicione pelo menos um produto ao carrinho.");
      return;
    }

    setErro("");
    setSucesso("");
    setProcessando(true);

    try {
      const venda = await createSale({
        cashRegisterId,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        paymentAmount: total,
        paymentMethod,
      });

      setCart([]);
      setSucesso(
        `Venda #${venda.id} realizada com sucesso! Total: ${formatarMoeda(venda.total)}.`,
      );

      await carregarProdutos();
    } catch (error) {
      setErro(obterMensagemErro(error));
    } finally {
      setProcessando(false);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <p
          className="text-sm font-semibold"
          style={{ color: "var(--color-primary)" }}
        >
          OPERAÇÕES
        </p>
        <h2 className="mt-1 text-2xl font-bold">Registrar venda</h2>
        <p
          className="mt-1 text-sm"
          style={{ color: "var(--color-text-muted)" }}
        >
          Selecione os produtos, confira o carrinho e finalize o pagamento.
        </p>
      </div>

      {erro && (
        <div
          role="alert"
          className="rounded-xl border border-red-400/40 p-4 text-sm"
          style={{
            backgroundColor: "var(--color-surface-muted)",
            color: "#dc2626",
          }}
        >
          {erro}
        </div>
      )}

      {sucesso && (
        <div
          role="status"
          className="rounded-xl border border-emerald-500/40 p-4 text-sm"
          style={{
            backgroundColor: "var(--color-surface-muted)",
            color: "var(--color-primary)",
          }}
        >
          {sucesso}
        </div>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_390px]">
        <div className="space-y-4">
          <div
            className="flex items-center gap-3 rounded-xl border px-4 py-3"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
            }}
          >
            <Search size={20} style={{ color: "var(--color-text-muted)" }} />
            <input
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar produto ou categoria..."
              className="w-full bg-transparent text-sm outline-none"
              style={{ color: "var(--color-text)" }}
            />
          </div>
          {carregando ? (
            <div
              className="flex items-center justify-center gap-3 p-12"
              style={cardStyle}
            >
              <LoaderCircle
                className="animate-spin"
                style={{ color: "var(--color-primary)" }}
              />
              <span>Carregando produtos...</span>
            </div>
          ) : produtosFiltrados.length === 0 ? (
            <div className="p-10 text-center" style={cardStyle}>
              <Package
                size={36}
                className="mx-auto mb-3"
                style={{ color: "var(--color-text-muted)" }}
              />
              <p className="font-semibold">Nenhum produto disponível</p>
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                Verifique a busca ou o estoque dos produtos.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {produtosPaginados.map((product) => {
                const estoque = product.inventory?.quantity ?? 0;

                return (
                  <article
                    key={product.id}
                    className="flex flex-col justify-between gap-4 p-5 transition hover:-translate-y-1"
                    style={cardStyle}
                  >
                    <div>
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <span
                          className="rounded-lg px-2.5 py-1 text-xs font-semibold"
                          style={{
                            backgroundColor: "var(--color-surface-muted)",
                            color: "var(--color-primary)",
                          }}
                        >
                          {product.category?.name ?? "Sem categoria"}
                        </span>

                        <span
                          className="text-xs"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          Estoque: {estoque}
                        </span>
                      </div>

                      <h3 className="font-bold">{product.name}</h3>

                      <p
                        className="mt-1 min-h-10 text-sm"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {product.description || "Sem descrição"}
                      </p>
                    </div>

                    <div>
                      <p
                        className="mb-3 text-xl font-bold"
                        style={{ color: "var(--color-primary)" }}
                      >
                        {formatarMoeda(product.salePrice)}
                      </p>

                      <button
                        type="button"
                        onClick={() => adicionarProduto(product)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                        style={{
                          backgroundColor: "var(--color-primary)",
                        }}
                      >
                        <Plus size={17} />
                        Adicionar
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}{" "}
          {!carregando && produtosFiltrados.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalItems={produtosFiltrados.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          )}
        </div>

        <aside className="space-y-5 p-5 xl:sticky xl:top-6" style={cardStyle}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart
                size={22}
                style={{ color: "var(--color-primary)" }}
              />
              <h3 className="text-lg font-bold">Carrinho</h3>
            </div>

            <span
              className="rounded-full px-3 py-1 text-xs font-bold"
              style={{
                backgroundColor: "var(--color-surface-muted)",
                color: "var(--color-primary)",
              }}
            >
              {cart.reduce((soma, item) => soma + item.quantity, 0)} itens
            </span>
          </div>

          {cart.length === 0 ? (
            <div
              className="rounded-xl p-7 text-center"
              style={{ backgroundColor: "var(--color-surface-muted)" }}
            >
              <ShoppingCart
                size={30}
                className="mx-auto mb-2"
                style={{ color: "var(--color-text-muted)" }}
              />
              <p className="text-sm font-medium">Seu carrinho está vazio</p>
            </div>
          ) : (
            <div className="max-h-80 space-y-3 overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="rounded-xl p-3"
                  style={{
                    backgroundColor: "var(--color-surface-muted)",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {item.product.name}
                      </p>
                      <p
                        className="mt-1 text-xs"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {formatarMoeda(item.product.salePrice)} / unidade
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removerProduto(item.product.id)}
                      aria-label={`Remover ${item.product.name}`}
                      className="rounded-lg p-1.5 text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => alterarQuantidade(item.product.id, -1)}
                        aria-label="Diminuir quantidade"
                        className="rounded-lg border p-1.5"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        <Minus size={14} />
                      </button>

                      <span className="min-w-5 text-center text-sm font-bold">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => alterarQuantidade(item.product.id, 1)}
                        aria-label="Aumentar quantidade"
                        className="rounded-lg border p-1.5"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <span className="text-sm font-bold">
                      {formatarMoeda(
                        Number(item.product.salePrice) * item.quantity,
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div
            className="space-y-2 border-t pt-4"
            style={{ borderColor: "var(--color-border)" }}
          >
            <label htmlFor="paymentMethod" className="text-sm font-semibold">
              Forma de pagamento
            </label>

            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(event) =>
                setPaymentMethod(event.target.value as PaymentMethod)
              }
              className="w-full rounded-xl border px-3 py-3 text-sm outline-none"
              style={{
                backgroundColor: "var(--color-bg)",
                color: "var(--color-text)",
                borderColor: "var(--color-border)",
              }}
            >
              <option value="DINERO">Dinheiro</option>
              <option value="TARJETA">Cartão</option>
              <option value="PIX">PIX</option>
              <option value="QR">QR Code</option>
            </select>
          </div>

          <div
            className="flex items-center justify-between border-t pt-4"
            style={{ borderColor: "var(--color-border)" }}
          >
            <span
              className="font-semibold"
              style={{ color: "var(--color-text-muted)" }}
            >
              Total da venda
            </span>
            <span className="text-2xl font-bold">{formatarMoeda(total)}</span>
          </div>

          <button
            type="button"
            onClick={finalizarVenda}
            disabled={processando || cart.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {processando ? (
              <LoaderCircle size={19} className="animate-spin" />
            ) : (
              <CreditCard size={19} />
            )}
            {processando ? "Finalizando..." : "Finalizar venda"}
          </button>
        </aside>
      </div>
    </section>
  );
}
