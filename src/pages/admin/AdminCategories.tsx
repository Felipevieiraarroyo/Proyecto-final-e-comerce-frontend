import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Tags,
  LoaderCircle,
  AlertTriangle,
} from "lucide-react";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from "../../services/categoryService";

const initialForm = {
  name: "",
  description: "",
};

type CategoryForm = typeof initialForm;

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

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryForm>(initialForm);

  async function loadCategories() {
    try {
      setLoading(true);
      setError("");

      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return categories;

    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(term) ||
        (category.description ?? "").toLowerCase().includes(term),
    );
  }, [categories, search]);

  function openCreateModal() {
    setEditingCategory(null);
    setForm(initialForm);
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function openEditModal(category: Category) {
    setEditingCategory(category);
    setForm({
      name: category.name,
      description: category.description ?? "",
    });
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingCategory(null);
    setForm(initialForm);
  }

  function updateField(field: keyof CategoryForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Informe o nome da categoria.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const data = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, data);
        setSuccess("Categoria atualizada com sucesso!");
      } else {
        await createCategory(data);
        setSuccess("Categoria cadastrada com sucesso!");
      }

      setModalOpen(false);
      setEditingCategory(null);
      setForm(initialForm);

      await loadCategories();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category: Category) {
    const confirmed = window.confirm(
      `Deseja realmente excluir a categoria "${category.name}"?`,
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteCategory(category.id);

      setSuccess("Categoria excluída com sucesso!");
      await loadCategories();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-2xl font-bold">Categorias da loja</h3>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            Organize os produtos e mantenha seu catálogo estruturado.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
        >
          <Plus size={19} />
          Nova categoria
        </button>
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
            placeholder="Buscar por nome ou descrição..."
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
              Carregando categorias...
            </span>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-16 text-center">
            <Tags size={42} className="mx-auto text-emerald-600/50" />
            <p className="mt-3 font-semibold">
              {search
                ? "Nenhuma categoria encontrada."
                : "Nenhuma categoria cadastrada."}
            </p>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--color-text-muted)" }}
            >
              {search
                ? "Tente pesquisar com outro termo."
                : "Cadastre sua primeira categoria para começar."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr
                  className="border-b text-xs uppercase tracking-wide"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  <th className="px-3 py-4">Categoria</th>
                  <th className="px-3 py-4">Descrição</th>
                  <th className="px-3 py-4 text-right">Ações</th>
                </tr>
              </thead>

              <tbody>
                {filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="border-b last:border-0"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600">
                          <Tags size={19} />
                        </div>
                        <span className="font-bold">{category.name}</span>
                      </div>
                    </td>

                    <td className="px-3 py-4">
                      <span style={{ color: "var(--color-text-muted)" }}>
                        {category.description || "Sem descrição"}
                      </span>
                    </td>

                    <td className="px-3 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(category)}
                          title="Editar categoria"
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-500/10"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(category)}
                          title="Excluir categoria"
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-500/10"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p
          className="mt-4 text-xs"
          style={{ color: "var(--color-text-muted)" }}
        >
          {filteredCategories.length} categoria(s) encontrada(s)
        </p>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/60 p-4">
          <div
            className="my-auto w-full max-w-xl rounded-2xl border p-6 shadow-2xl"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">
                  {editingCategory ? "Editar categoria" : "Nova categoria"}
                </h3>
                <p
                  className="mt-1 text-sm"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Informe os dados da categoria.
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
                  Nome da categoria
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text)",
                  }}
                  placeholder="Ex.: Acessórios"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Descrição
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text)",
                  }}
                  placeholder="Descrição opcional da categoria"
                />
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
                  {saving
                    ? "Salvando..."
                    : editingCategory
                      ? "Salvar alterações"
                      : "Cadastrar categoria"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
