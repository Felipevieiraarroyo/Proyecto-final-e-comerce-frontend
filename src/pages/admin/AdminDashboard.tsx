import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Package,
  Tags,
  Warehouse,
  Receipt,
  LogOut,
  Menu,
  X,
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  DollarSign,
  ClipboardList,
} from "lucide-react";

import { useAuthStore } from "../../stores/useAuthStore";
import ThemeToggle from "../../components/ThemeToggle";

import { getProducts } from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import { getInventory } from "../../services/inventoryService";
import { getSales } from "../../services/salesService";
import AdminProducts from "./AdminProducts";
import AdminCategories from "./AdminCategories";
import AdminInventory from "./AdminInventory";
import AdminSales from "./AdminSales";
import AdminOrders from "./AdminOrders";

import type { Product } from "../../types/product";
import type { Category } from "../../services/categoryService";
import type { InventoryItem } from "../../services/inventoryService";
import type { Sale } from "../../services/salesService";

type AdminSection =
  | "dashboard"
  | "products"
  | "categories"
  | "inventory"
  | "sales"
  | "orders";

const navigation = [
  { id: "dashboard", label: "Visão geral", icon: LayoutDashboard },
  { id: "products", label: "Produtos", icon: Package },
  { id: "categories", label: "Categorias", icon: Tags },
  { id: "inventory", label: "Estoque", icon: Warehouse },
  { id: "sales", label: "Vendas", icon: Receipt },
  { id: "orders", label: "Pedidos", icon: ClipboardList },
] as const;

export default function AdminDashboard() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [productsData, categoriesData, inventoryData, salesData] =
          await Promise.all([
            getProducts(),
            getCategories(),
            getInventory(),
            getSales(),
          ]);

        setProducts(productsData);
        setCategories(categoriesData);
        setInventory(inventoryData);
        setSales(salesData);
      } catch {
        setError(
          "Não foi possível carregar os dados administrativos. Verifique sua conexão e tente novamente.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const totalRevenue = useMemo(
    () => sales.reduce((total, sale) => total + Number(sale.total), 0),
    [sales],
  );

  const lowStock = inventory.filter((item) => item.quantity <= 5).length;

  const metrics = [
    {
      label: "Produtos cadastrados",
      value: products.length,
      icon: Package,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Categorias",
      value: categories.length,
      icon: Tags,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Itens com estoque baixo",
      value: lowStock,
      icon: AlertTriangle,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      label: "Vendas realizadas",
      value: sales.length,
      icon: ShoppingBag,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
  ];

  const sectionTitle =
    navigation.find((item) => item.id === activeSection)?.label ??
    "Visão geral";

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: "var(--color-bg)",
        color: "var(--color-text)",
      }}
    >
      <div className="flex min-h-screen">
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r p-5 transition-transform duration-300 lg:static lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{
            backgroundColor: "var(--color-sidebar)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-wide text-white">
                VIBRA STORE
              </h1>
              <p className="mt-1 text-xs font-medium tracking-[0.2em] text-emerald-200">
                ADMINISTRAÇÃO
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="text-white lg:hidden"
              aria-label="Fechar menu"
            >
              <X size={22} />
            </button>
          </div>

          <div className="mt-10">
            <p className="mb-4 px-3 text-xs font-bold uppercase tracking-widest text-emerald-200/60">
              Menu principal
            </p>

            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveSection(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                      active
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-950/20"
                        : "text-emerald-50/75 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={19} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">
              {user?.email ?? "Administrador"}
            </p>
            <p className="mt-1 text-xs text-emerald-200">
              Perfil administrador
            </p>

            <button
              type="button"
              onClick={logout}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/15 px-3 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/25"
            >
              <LogOut size={17} />
              Sair do sistema
            </button>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header
            className="sticky top-0 z-30 flex items-center justify-between border-b px-5 py-4 sm:px-8"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
            }}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 lg:hidden"
                aria-label="Abrir menu"
              >
                <Menu size={22} />
              </button>

              <div>
                <h2 className="text-xl font-bold sm:text-2xl">
                  {sectionTitle}
                </h2>
                <p
                  className="hidden text-sm sm:block"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Gerencie sua loja em um só lugar.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 sm:inline-flex">
                ADMIN
              </span>
              <ThemeToggle />
            </div>
          </header>
          <div className="p-5 sm:p-8">
            {activeSection === "dashboard" && (
              <>
                {error && (
                  <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">
                    <AlertTriangle size={20} />
                    {error}
                  </div>
                )}

                {loading ? (
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {metrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="h-36 animate-pulse rounded-2xl"
                        style={{
                          backgroundColor: "var(--color-surface-muted)",
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                      {metrics.map((metric) => {
                        const Icon = metric.icon;

                        return (
                          <article
                            key={metric.label}
                            className="rounded-2xl border p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                            style={{
                              backgroundColor: "var(--color-surface)",
                              borderColor: "var(--color-border)",
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div
                                className={`rounded-xl p-3 ${metric.bg} ${metric.color}`}
                              >
                                <Icon size={23} />
                              </div>
                              <TrendingUp
                                size={18}
                                className="text-emerald-500"
                              />
                            </div>

                            <p
                              className="mt-5 text-sm"
                              style={{
                                color: "var(--color-text-muted)",
                              }}
                            >
                              {metric.label}
                            </p>

                            <h3 className="mt-1 text-3xl font-black">
                              {metric.value}
                            </h3>
                          </article>
                        );
                      })}
                    </div>

                    <div className="mt-6 grid gap-5 xl:grid-cols-3">
                      <article
                        className="rounded-2xl border p-6 shadow-sm xl:col-span-2"
                        style={{
                          backgroundColor: "var(--color-surface)",
                          borderColor: "var(--color-border)",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600">
                            <DollarSign size={24} />
                          </div>
                          <div>
                            <p
                              className="text-sm"
                              style={{
                                color: "var(--color-text-muted)",
                              }}
                            >
                              Receita acumulada das vendas
                            </p>
                            <h3 className="mt-1 text-3xl font-black">
                              {formatCurrency(totalRevenue)}
                            </h3>
                          </div>
                        </div>

                        <p
                          className="mt-5 text-sm"
                          style={{
                            color: "var(--color-text-muted)",
                          }}
                        >
                          Valor total das vendas retornadas pela API.
                        </p>
                      </article>

                      <article
                        className="rounded-2xl border p-6 shadow-sm"
                        style={{
                          backgroundColor: "var(--color-surface)",
                          borderColor: "var(--color-border)",
                        }}
                      >
                        <div className="rounded-xl bg-amber-500/10 p-3 text-amber-600 w-fit">
                          <Warehouse size={24} />
                        </div>
                        <p
                          className="mt-4 text-sm"
                          style={{
                            color: "var(--color-text-muted)",
                          }}
                        >
                          Unidades em estoque
                        </p>
                        <h3 className="mt-1 text-3xl font-black">
                          {inventory.reduce(
                            (total, item) => total + item.quantity,
                            0,
                          )}
                        </h3>
                      </article>
                    </div>

                    <section
                      className="mt-6 rounded-2xl border p-6 shadow-sm"
                      style={{
                        backgroundColor: "var(--color-surface)",
                        borderColor: "var(--color-border)",
                      }}
                    >
                      <h3 className="text-lg font-bold">Vendas recentes</h3>

                      {sales.length === 0 ? (
                        <p
                          className="mt-4 text-sm"
                          style={{
                            color: "var(--color-text-muted)",
                          }}
                        >
                          Nenhuma venda encontrada.
                        </p>
                      ) : (
                        <div className="mt-4 overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead>
                              <tr
                                className="border-b"
                                style={{
                                  borderColor: "var(--color-border)",
                                  color: "var(--color-text-muted)",
                                }}
                              >
                                <th className="py-3 pr-4">Venda</th>
                                <th className="py-3 pr-4">Data</th>
                                <th className="py-3">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sales.slice(0, 5).map((sale) => (
                                <tr
                                  key={sale.id}
                                  className="border-b last:border-0"
                                  style={{
                                    borderColor: "var(--color-border)",
                                  }}
                                >
                                  <td className="py-3 pr-4 font-semibold">
                                    #{sale.id}
                                  </td>
                                  <td className="py-3 pr-4">
                                    {new Date(sale.createdAt).toLocaleString(
                                      "pt-BR",
                                    )}
                                  </td>
                                  <td className="py-3 font-bold text-emerald-600">
                                    {formatCurrency(Number(sale.total))}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </section>
                  </>
                )}
              </>
            )}

            {activeSection === "products" && <AdminProducts />}

            {activeSection === "categories" && <AdminCategories />}

            {activeSection === "inventory" && <AdminInventory />}

            {activeSection === "sales" && <AdminSales />}

            {activeSection === "orders" && <AdminOrders />}

            {activeSection !== "dashboard" &&
              activeSection !== "products" &&
              activeSection !== "categories" &&
              activeSection !== "inventory" &&
              activeSection !== "sales" && (
                <div
                  className="rounded-2xl border p-8 text-center shadow-sm"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <h3 className="text-xl font-bold">{sectionTitle}</h3>
                  <p
                    className="mt-2"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Esta área será implementada na próxima etapa.
                  </p>
                </div>
              )}
          </div>
        </section>
      </div>
    </main>
  );
}
