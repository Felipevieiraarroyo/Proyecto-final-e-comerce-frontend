import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  LoaderCircle,
  LogOut,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Store,
  Trash2,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";
import { getProducts } from "../../services/productService";
import {
  addCartItem,
  getMyCart,
  updateCartItem,
  removeCartItem,
  type Cart,
} from "../../services/cartService";
import type { Product } from "../../types/product";
import Pagination from "../../components/ui/Pagination";
import ThemeToggle from "../../components/ThemeToggle";
import ClientCheckout from "../../components/client/ClientChekout";
import type { Order } from "../../services/orderService";
import ClientOrderHistory from "../../components/client/ClientOrderHistory";

const PAGE_SIZE = 5;

function formatarPreco(valor: number | string) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function ClientDashboard() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Cart | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [currentPage, setCurrentPage] = useState(1);

  const [addingProductId, setAddingProductId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [ordersRefreshKey, setOrdersRefreshKey] = useState(0);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [updatingCartItemId, setUpdatingCartItemId] = useState<number | null>(
    null,
  );
  const [removingCartItemId, setRemovingCartItemId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      setError("");

      try {
        const [productsResult, cartResult] = await Promise.allSettled([
          getProducts(),
          getMyCart(),
        ]);

        if (productsResult.status === "fulfilled") {
          setProducts(productsResult.value);
        } else {
          setError("Não foi possível carregar os produtos.");
        }

        if (cartResult.status === "fulfilled") {
          setCart(cartResult.value);
        }
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  const categories = useMemo(() => {
    return [
      "Todas",
      ...new Set(products.map((product) => product.category.name)),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term) ||
        product.category.name.toLowerCase().includes(term);

      const matchesCategory =
        categoryFilter === "Todas" || product.category.name === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;

    return filteredProducts.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  const cartCount = useMemo(() => {
    return cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return (
      cart?.items.reduce(
        (total, item) => total + Number(item.product.salePrice) * item.quantity,
        0,
      ) ?? 0
    );
  }, [cart]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter]);

  async function handleAddToCart(product: Product) {
    setAddingProductId(product.id);
    setSuccessMessage("");
    setError("");

    try {
      await addCartItem({
        productId: product.id,
        quantity: 1,
      });

      const updatedCart = await getMyCart();
      setCart(updatedCart);

      setSuccessMessage(`${product.name} adicionado ao carrinho.`);
    } catch {
      setError("Não foi possível adicionar o produto ao carrinho.");
    } finally {
      setAddingProductId(null);
    }
  }
  async function handleUpdateCartQuantity(itemId: number, quantity: number) {
    if (quantity < 1) return;

    setUpdatingCartItemId(itemId);
    setError("");
    setSuccessMessage("");

    try {
      await updateCartItem(itemId, { quantity });

      const updatedCart = await getMyCart();
      setCart(updatedCart);
    } catch {
      setError(
        "Não foi possível atualizar a quantidade. Verifique o estoque disponível.",
      );
    } finally {
      setUpdatingCartItemId(null);
    }
  }

  async function handleRemoveCartItem(itemId: number) {
    setRemovingCartItemId(itemId);
    setError("");
    setSuccessMessage("");

    try {
      await removeCartItem(itemId);

      const updatedCart = await getMyCart();
      setCart(updatedCart);

      setSuccessMessage("Produto removido do carrinho.");
    } catch {
      setError("Não foi possível remover o produto do carrinho.");
    } finally {
      setRemovingCartItemId(null);
    }
  }

  function handleGoToCheckout() {
    setIsCartOpen(false);

    document.getElementById("checkout")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
  function handleLogout() {
    logout();
    navigate("/login");
  }
  async function handleCheckoutComplete(order: Order) {
    setCart(null);
    setSuccessMessage(`Pedido #${order.id} realizado com sucesso!`);

    setOrdersRefreshKey((previous) => previous + 1);

    try {
      const updatedCart = await getMyCart();
      setCart(updatedCart);
    } catch {}
  }

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: "var(--color-bg)",
        color: "var(--color-text)",
      }}
    >
      {isCartOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/50"
          onClick={() => setIsCartOpen(false)}
        >
          <aside
            className="flex h-full w-full max-w-md flex-col shadow-2xl"
            style={{
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text)",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex items-center justify-between border-b p-5"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="flex items-center gap-3">
                <ShoppingCart
                  size={22}
                  style={{ color: "var(--color-primary)" }}
                />

                <div>
                  <h2 className="text-lg font-bold">Meu carrinho</h2>
                  <p
                    className="text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {cartCount} item(ns) selecionado(s)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:opacity-70"
                style={{ backgroundColor: "var(--color-surface-muted)" }}
                aria-label="Fechar carrinho"
              >
                <X size={19} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {!cart || cart.items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingCart
                    size={48}
                    strokeWidth={1.3}
                    style={{ color: "var(--color-text-muted)" }}
                  />

                  <h3 className="mt-4 font-semibold">
                    Seu carrinho está vazio
                  </h3>

                  <p
                    className="mt-2 max-w-xs text-sm"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Explore nosso catálogo e adicione produtos para começar sua
                    compra.
                  </p>

                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="mt-5 rounded-xl px-5 py-3 text-sm font-semibold text-white"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    Explorar produtos
                  </button>
                </div>
              ) : (
                cart.items.map((item) => {
                  const isUpdating = updatingCartItemId === item.id;
                  const isRemoving = removingCartItemId === item.id;

                  return (
                    <article
                      key={item.id}
                      className="rounded-xl border p-4"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <div className="flex gap-3">
                        <div
                          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl"
                          style={{
                            backgroundColor: "var(--color-surface-muted)",
                            color: "var(--color-primary)",
                          }}
                        >
                          <Package size={29} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-bold">
                            {item.product.name}
                          </h3>

                          <p
                            className="mt-1 text-sm"
                            style={{ color: "var(--color-primary)" }}
                          >
                            {formatarPreco(item.product.salePrice)}
                          </p>

                          <p
                            className="mt-1 text-xs"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            Subtotal:{" "}
                            {formatarPreco(
                              Number(item.product.salePrice) * item.quantity,
                            )}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveCartItem(item.id)}
                          disabled={isRemoving || isUpdating}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                          title="Remover produto"
                          aria-label={`Remover ${item.product.name}`}
                        >
                          {isRemoving ? (
                            <LoaderCircle size={17} className="animate-spin" />
                          ) : (
                            <Trash2 size={17} />
                          )}
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span
                          className="text-xs font-medium"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          Quantidade
                        </span>

                        <div
                          className="flex items-center gap-3 rounded-lg border p-1"
                          style={{ borderColor: "var(--color-border)" }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateCartQuantity(
                                item.id,
                                item.quantity - 1,
                              )
                            }
                            disabled={
                              item.quantity <= 1 || isUpdating || isRemoving
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-md transition hover:opacity-70 disabled:opacity-30"
                            style={{
                              backgroundColor: "var(--color-surface-muted)",
                            }}
                            aria-label="Diminuir quantidade"
                          >
                            <Minus size={15} />
                          </button>

                          <span className="min-w-5 text-center text-sm font-bold">
                            {isUpdating ? (
                              <LoaderCircle
                                size={15}
                                className="mx-auto animate-spin"
                              />
                            ) : (
                              item.quantity
                            )}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateCartQuantity(
                                item.id,
                                item.quantity + 1,
                              )
                            }
                            disabled={isUpdating || isRemoving}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-white transition hover:opacity-80 disabled:opacity-50"
                            style={{
                              backgroundColor: "var(--color-primary)",
                            }}
                            aria-label="Aumentar quantidade"
                          >
                            <Plus size={15} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            <div
              className="space-y-4 border-t p-5"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-sm"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Subtotal
                </span>

                <strong className="text-xl">
                  {formatarPreco(cartSubtotal)}
                </strong>
              </div>

              <button
                type="button"
                onClick={handleGoToCheckout}
                disabled={cartCount === 0}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                Continuar para pagamento
              </button>

              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="w-full py-2 text-sm font-semibold transition hover:opacity-70"
                style={{ color: "var(--color-text-muted)" }}
              >
                Continuar comprando
              </button>
            </div>
          </aside>
        </div>
      )}
      <header
        className="sticky top-0 z-20 border-b backdrop-blur-md"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "#ffffff",
              }}
            >
              <Store size={23} />
            </div>

            <div>
              <h1 className="text-lg font-bold sm:text-xl">Minha Loja</h1>
              <p
                className="text-xs"
                style={{ color: "var(--color-text-muted)" }}
              >
                Sua experiência de compras
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">
                {user?.name || user?.email}
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--color-text-muted)" }}
              >
                Cliente
              </p>
            </div>

            <ThemeToggle />

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border transition hover:opacity-80"
              style={{
                backgroundColor: "var(--color-surface-muted)",
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
              }}
              title={`${cartCount} itens no carrinho`}
              aria-label="Abrir carrinho"
            >
              <ShoppingCart size={19} />

              {cartCount > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition hover:opacity-80"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
              }}
              title="Sair"
            >
              <LogOut size={17} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section
          className="overflow-hidden rounded-2xl p-6 shadow-sm sm:p-8"
          style={{
            background:
              "linear-gradient(120deg, var(--color-sidebar), var(--color-primary))",
            color: "#ffffff",
          }}
        >
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="mb-2 text-sm font-medium text-emerald-100">
                Bem-vindo à sua loja
              </p>

              <h2 className="text-2xl font-bold sm:text-3xl">
                Olá, {user?.name || "Cliente"}!
              </h2>

              <p className="mt-2 max-w-xl text-sm text-emerald-50">
                Explore nosso catálogo e encontre os produtos ideais para você.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-4">
              <ShoppingCart size={28} />
              <div>
                <p className="text-xs text-emerald-100">Itens no carrinho</p>
                <p className="text-2xl font-bold">{cartCount}</p>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div
            className="flex items-center gap-3 rounded-xl border p-4 text-sm"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "#dc2626",
              color: "#dc2626",
            }}
          >
            <AlertCircle size={19} />
            {error}
          </div>
        )}

        {successMessage && (
          <div
            className="rounded-xl border p-4 text-sm"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-primary)",
              color: "var(--color-primary)",
            }}
          >
            {successMessage}
          </div>
        )}

        <section className="space-y-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "var(--color-accent)" }}
              >
                Catálogo
              </p>
              <h2 className="mt-1 text-2xl font-bold">Nossos produtos</h2>
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                Encontre o que você procura.
              </p>
            </div>

            <div
              className="text-sm"
              style={{ color: "var(--color-text-muted)" }}
            >
              {filteredProducts.length} produto(s) encontrado(s)
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: "var(--color-text-muted)" }}
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por produto ou categoria..."
                className="h-12 w-full rounded-xl border pl-11 pr-4 text-sm outline-none transition focus:ring-2"
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="h-12 rounded-xl border px-4 text-sm outline-none"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
              }}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex min-h-52 items-center justify-center gap-3">
              <LoaderCircle
                className="animate-spin"
                size={25}
                style={{ color: "var(--color-primary)" }}
              />
              <span style={{ color: "var(--color-text-muted)" }}>
                Carregando catálogo...
              </span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div
              className="rounded-2xl border p-10 text-center"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
              }}
            >
              <Package
                className="mx-auto mb-3"
                size={35}
                style={{ color: "var(--color-text-muted)" }}
              />
              <h3 className="font-semibold">Nenhum produto encontrado</h3>
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                Tente alterar sua busca ou selecionar outra categoria.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedProducts.map((product) => {
                  const stock = product.inventory?.quantity ?? 0;
                  const isAdding = addingProductId === product.id;

                  return (
                    <article
                      key={product.id}
                      className="flex flex-col overflow-hidden rounded-2xl border shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                      style={{
                        backgroundColor: "var(--color-surface)",
                        borderColor: "var(--color-border)",
                      }}
                    >
                      <div
                        className="flex h-32 items-center justify-center"
                        style={{
                          backgroundColor: "var(--color-surface-muted)",
                          color: "var(--color-primary)",
                        }}
                      >
                        <Package size={48} strokeWidth={1.4} />
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <span
                            className="rounded-full px-3 py-1 text-xs font-semibold"
                            style={{
                              backgroundColor: "var(--color-surface-muted)",
                              color: "var(--color-primary)",
                            }}
                          >
                            {product.category.name}
                          </span>

                          <span
                            className="text-xs font-medium"
                            style={{
                              color:
                                stock > 0 ? "var(--color-primary)" : "#dc2626",
                            }}
                          >
                            {stock > 0 ? `${stock} em estoque` : "Indisponível"}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold">{product.name}</h3>

                        <p
                          className="mt-2 min-h-10 text-sm"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          {product.description ||
                            "Produto disponível em nossa loja."}
                        </p>

                        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                          <div>
                            <p
                              className="text-xs"
                              style={{ color: "var(--color-text-muted)" }}
                            >
                              Preço
                            </p>
                            <p
                              className="text-xl font-bold"
                              style={{ color: "var(--color-primary)" }}
                            >
                              {formatarPreco(product.salePrice)}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            disabled={
                              stock <= 0 || isAdding || addingProductId !== null
                            }
                            className="flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            style={{ backgroundColor: "var(--color-primary)" }}
                          >
                            {isAdding ? (
                              <LoaderCircle
                                size={17}
                                className="animate-spin"
                              />
                            ) : (
                              <Plus size={17} />
                            )}
                            Adicionar
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <Pagination
                currentPage={currentPage}
                totalItems={filteredProducts.length}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </section>

        <section
          id="checkout"
          className="rounded-2xl border p-5 sm:p-6"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <ShoppingCart
                  size={20}
                  style={{ color: "var(--color-primary)" }}
                />
                <h2 className="text-lg font-bold">Resumo do carrinho</h2>
              </div>
            </div>

            <div className="sm:text-right">
              <p
                className="text-xs"
                style={{ color: "var(--color-text-muted)" }}
              >
                Subtotal
              </p>
              <p className="text-2xl font-bold">
                {formatarPreco(cartSubtotal)}
              </p>
            </div>
          </div>
          <ClientCheckout
            cartCount={cartCount}
            onCheckoutComplete={handleCheckoutComplete}
          />
          {cart?.items.length === 0 && (
            <p
              className="mt-4 border-t pt-4 text-sm"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-text-muted)",
              }}
            >
              Seu carrinho ainda está vazio. Adicione produtos do catálogo para
              começar.
            </p>
          )}
        </section>
        <ClientOrderHistory refreshKey={ordersRefreshKey} />
      </div>
    </main>
  );
}
