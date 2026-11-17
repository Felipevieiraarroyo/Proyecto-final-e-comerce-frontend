import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Pencil,
  X,
  Warehouse,
  LoaderCircle,
  AlertTriangle,
  Package,
  Boxes,
  TrendingDown,
} from "lucide-react";

import {
  getInventory,
  updateInventory,
  type InventoryItem,
} from "../../services/inventoryService";
import { getProducts } from "../../services/productService";
import type { Product } from "../../types/product";

const LOW_STOCK_LIMIT = 5;

function getErrorMessage(error: unknown): string {
  const apiMessage = (
    error as {
      response?: {
        data?: {
          message?: string | string[];
        };
      };
    }
  )?.response?.data?.message;

  if (Array.isArray(apiMessage)) return apiMessage.join(", ");
  if (typeof apiMessage === "string") return apiMessage;

  return "Não foi possível concluir a operação. Tente novamente.";
}

export default function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [productsData, inventoryData] = await Promise.all([
        getProducts(),
        getInventory(),
      ]);

      setProducts(productsData);
      setInventory(inventoryData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const inventoryByProduct = useMemo(
    () => new Map(inventory.map((item) => [item.productId, item])),
    [inventory],
  );

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return products;

    return products.filter((product) =>
      product.name.toLowerCase().includes(term),
    );
  }, [products, search]);

  const totalUnits = inventory.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const lowStockCount = inventory.filter(
    (item) => item.quantity <= LOW_STOCK_LIMIT,
  ).length;

  function openEditModal(item: InventoryItem) {
    setEditingItem(item);
    setQuantity(String(item.quantity));
    setError("");
    setSuccess("");
  }

  function closeModal() {
    if (saving) return;

    setEditingItem(null);
    setQuantity("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingItem) return;

    const parsedQuantity = Number(quantity);

    if (
      quantity.trim() === "" ||
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 0
    ) {
      setError("Informe uma quantidade inteira igual ou maior que zero.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await updateInventory(editingItem.productId, parsedQuantity);

      setEditingItem(null);
      setQuantity("");
      setSuccess(
        `Estoque de "${editingItem.product.name}" atualizado com sucesso!`,
      );

      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Controle de estoque</h3>
        <p
          className="mt-1 text-sm"
          style={{ color: "var(--color-text-muted)" }}
        >
          Consulte os produtos e acompanhe suas quantidades disponíveis.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">
          <AlertTriangle size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div
          className="rounded-2xl border p-5 shadow-sm"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-sm font-medium"
              style={{ color: "var(--color-text-muted)" }}
            >
              Produtos cadastrados
            </span>
            <Package className="text-emerald-600" size={22} />
          </div>
          <p className="mt-3 text-3xl font-bold tabular-nums">
            {products.length}
          </p>
        </div>

        <div
          className="rounded-2xl border p-5 shadow-sm"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-sm font-medium"
              style={{ color: "var(--color-text-muted)" }}
            >
              Unidades registradas
            </span>
            <Boxes className="text-emerald-600" size={22} />
          </div>
          <p className="mt-3 text-3xl font-bold tabular-nums">{totalUnits}</p>
        </div>

        <div
          className="rounded-2xl border p-5 shadow-sm"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-sm font-medium"
              style={{ color: "var(--color-text-muted)" }}
            >
              Estoque baixo
            </span>
            <TrendingDown className="text-amber-600" size={22} />
          </div>
          <p className="mt-3 text-3xl font-bold tabular-nums">
            {lowStockCount}
          </p>
          <p
            className="mt-1 text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            Até {LOW_STOCK_LIMIT} unidades
          </p>
        </div>
      </div>

      <div
        className="rounded-2xl border p-4 shadow-sm sm:p-6"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="relative mb-6 max-w-md">
          <Search
            size={19}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--color-text-muted)" }}
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar produto pelo nome..."
            className="w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500"
            style={{
              backgroundColor: "var(--color-bg)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16">
            <LoaderCircle className="animate-spin text-emerald-600" />
            <span style={{ color: "var(--color-text-muted)" }}>
              Carregando estoque...
            </span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <Warehouse size={42} className="mx-auto text-emerald-600/50" />
            <p className="mt-3 font-semibold">
              {search
                ? "Nenhum produto encontrado."
                : "Nenhum produto cadastrado."}
            </p>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--color-text-muted)" }}
            >
              Tente pesquisar com outro termo.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead>
                <tr
                  className="border-b text-xs uppercase tracking-wide"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  <th className="px-3 py-4">Produto</th>
                  <th className="px-3 py-4">Categoria</th>
                  <th className="px-3 py-4">Quantidade</th>
                  <th className="px-3 py-4">Situação</th>
                  <th className="px-3 py-4 text-right">Ação</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const item = inventoryByProduct.get(product.id);

                  return (
                    <tr
                      key={product.id}
                      className="border-b last:border-0"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600">
                            <Package size={19} />
                          </div>
                          <span className="font-bold">{product.name}</span>
                        </div>
                      </td>

                      <td
                        className="px-3 py-4"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {product.category?.name ?? "Sem categoria"}
                      </td>

                      <td className="px-3 py-4 font-semibold tabular-nums">
                        {item ? item.quantity : "—"}
                      </td>

                      <td className="px-3 py-4">
                        {!item ? (
                          <span className="inline-flex rounded-full bg-gray-500/10 px-3 py-1.5 text-xs font-semibold text-gray-500">
                            Não registrado
                          </span>
                        ) : item.quantity === 0 ? (
                          <span className="inline-flex rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-600">
                            Sem estoque
                          </span>
                        ) : item.quantity <= LOW_STOCK_LIMIT ? (
                          <span className="inline-flex rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-600">
                            Estoque baixo
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                            Disponível
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-4">
                        <div className="flex justify-end">
                          {item ? (
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              title="Atualizar estoque"
                              className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-500/10"
                            >
                              <Pencil size={17} />
                            </button>
                          ) : (
                            <span
                              className="text-xs"
                              style={{ color: "var(--color-text-muted)" }}
                            >
                              Sem registro
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p
          className="mt-4 text-xs"
          style={{ color: "var(--color-text-muted)" }}
        >
          {filteredProducts.length} produto(s) encontrado(s)
        </p>
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/60 p-4">
          <div
            className="my-auto w-full max-w-md rounded-2xl border p-6 shadow-2xl"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Atualizar estoque</h3>
                <p
                  className="mt-1 text-sm"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {editingItem.product.name}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 transition hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Fechar formulário"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Quantidade disponível
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text)",
                  }}
                />
                <p
                  className="mt-2 text-xs"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Quantidade atual: {editingItem.quantity} unidade(s). Informe
                  um número inteiro igual ou maior que zero.
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border px-5 py-3 text-sm font-semibold transition hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <LoaderCircle size={17} className="animate-spin" />
                  )}
                  {saving ? "Salvando..." : "Salvar quantidade"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
