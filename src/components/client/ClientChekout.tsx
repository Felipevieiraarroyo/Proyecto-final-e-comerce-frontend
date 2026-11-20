import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  MapPin,
  Plus,
  ShoppingBag,
} from "lucide-react";

import {
  createMyAddress,
  getMyAddresses,
  type Address,
  type CreateAddressData,
} from "../../services/addressService";

import {
  checkout,
  type Order,
  type PaymentMethod,
} from "../../services/orderService";

interface ClientCheckoutProps {
  cartCount: number;
  onCheckoutComplete: (order: Order) => void;
}

const FORM_INICIAL: CreateAddressData = {
  street: "",
  number: "",
  complement: "",
  city: "",
  reference: "",
};

const PAYMENT_OPTIONS: {
  value: PaymentMethod;
  label: string;
}[] = [
  { value: "PIX", label: "PIX" },
  { value: "TARJETA", label: "Cartão" },
  { value: "DINERO", label: "Dinheiro" },
  { value: "QR", label: "QR Code" },
];

export default function ClientCheckout({
  cartCount,
  onCheckoutComplete,
}: ClientCheckoutProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");

  const [form, setForm] = useState<CreateAddressData>(FORM_INICIAL);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);
  const [finishingOrder, setFinishingOrder] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadAddresses() {
      try {
        const result = await getMyAddresses();

        setAddresses(result);

        if (result.length > 0) {
          setSelectedAddressId(String(result[0].id));
        }
      } catch {
        setError("Não foi possível carregar seus endereços.");
      } finally {
        setLoadingAddresses(false);
      }
    }

    loadAddresses();
  }, []);

  function handleFormChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleCreateAddress(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSavingAddress(true);

    try {
      const data: CreateAddressData = {
        street: form.street.trim(),
        number: form.number.trim(),
        city: form.city.trim(),
        ...(form.complement?.trim()
          ? { complement: form.complement.trim() }
          : {}),
        ...(form.reference?.trim() ? { reference: form.reference.trim() } : {}),
      };

      const newAddress = await createMyAddress(data);

      setAddresses((previous) => [newAddress, ...previous]);
      setSelectedAddressId(String(newAddress.id));
      setForm(FORM_INICIAL);
      setShowAddressForm(false);
      setSuccess("Endereço cadastrado com sucesso.");
    } catch {
      setError("Não foi possível cadastrar o endereço.");
    } finally {
      setSavingAddress(false);
    }
  }

  async function handleCheckout() {
    if (!selectedAddressId) {
      setError("Selecione um endereço de entrega.");
      return;
    }

    if (cartCount === 0) {
      setError("Adicione produtos ao carrinho antes de finalizar.");
      return;
    }

    setError("");
    setSuccess("");
    setFinishingOrder(true);

    try {
      const result = await checkout({
        addressId: Number(selectedAddressId),
        paymentMethod,
      });

      onCheckoutComplete(result.order);
    } catch {
      setError(
        "Não foi possível finalizar o pedido. Verifique seu carrinho e o estoque disponível.",
      );
    } finally {
      setFinishingOrder(false);
    }
  }

  return (
    <section
      className="rounded-2xl border p-5 sm:p-6"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="mb-6 flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{
            backgroundColor: "var(--color-surface-muted)",
            color: "var(--color-primary)",
          }}
        >
          <ShoppingBag size={22} />
        </div>

        <div>
          <h2 className="text-lg font-bold">Finalizar compra</h2>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Confira a entrega e a forma de pagamento.
          </p>
        </div>
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

      {success && (
        <div
          className="mb-4 flex items-center gap-2 rounded-xl border p-3 text-sm"
          style={{
            borderColor: "var(--color-primary)",
            color: "var(--color-primary)",
          }}
        >
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 font-semibold">
              <MapPin size={18} style={{ color: "var(--color-primary)" }} />
              Endereço de entrega
            </h3>

            <button
              type="button"
              onClick={() => {
                setShowAddressForm((previous) => !previous);
                setError("");
              }}
              className="flex items-center gap-1 text-sm font-semibold"
              style={{ color: "var(--color-primary)" }}
            >
              <Plus size={17} />
              Novo endereço
            </button>
          </div>

          {loadingAddresses ? (
            <div className="flex items-center gap-2 py-4 text-sm">
              <LoaderCircle size={18} className="animate-spin" />
              Carregando endereços...
            </div>
          ) : addresses.length === 0 ? (
            <p
              className="rounded-xl p-4 text-sm"
              style={{
                backgroundColor: "var(--color-surface-muted)",
                color: "var(--color-text-muted)",
              }}
            >
              Você ainda não possui endereços cadastrados. Adicione um endereço
              para continuar.
            </p>
          ) : (
            <div className="space-y-2">
              {addresses.map((address) => (
                <label
                  key={address.id}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition"
                  style={{
                    backgroundColor:
                      selectedAddressId === String(address.id)
                        ? "var(--color-surface-muted)"
                        : "transparent",
                    borderColor:
                      selectedAddressId === String(address.id)
                        ? "var(--color-primary)"
                        : "var(--color-border)",
                  }}
                >
                  <input
                    type="radio"
                    name="deliveryAddress"
                    value={address.id}
                    checked={selectedAddressId === String(address.id)}
                    onChange={(event) =>
                      setSelectedAddressId(event.target.value)
                    }
                    className="mt-1 accent-emerald-600"
                  />

                  <span className="text-sm">
                    <strong>
                      {address.street}, {address.number}
                    </strong>
                    <span
                      className="mt-1 block"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {address.complement ? `${address.complement} · ` : ""}
                      {address.city}
                    </span>
                    {address.reference && (
                      <span
                        className="mt-1 block text-xs"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        Referência: {address.reference}
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          )}

          {showAddressForm && (
            <form
              onSubmit={handleCreateAddress}
              className="mt-4 space-y-3 rounded-xl border p-4"
              style={{ borderColor: "var(--color-border)" }}
            >
              <h4 className="font-semibold">Cadastrar endereço</h4>

              <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                <input
                  name="street"
                  value={form.street}
                  onChange={handleFormChange}
                  placeholder="Rua / Avenida"
                  required
                  className="h-11 min-w-0 rounded-lg border px-3 text-sm"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text)",
                  }}
                />

                <input
                  name="number"
                  value={form.number}
                  onChange={handleFormChange}
                  placeholder="Número"
                  required
                  className="h-11 rounded-lg border px-3 text-sm"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text)",
                  }}
                />
              </div>

              <input
                name="complement"
                value={form.complement}
                onChange={handleFormChange}
                placeholder="Complemento (opcional)"
                className="h-11 w-full rounded-lg border px-3 text-sm"
                style={{
                  backgroundColor: "var(--color-bg)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
              />

              <input
                name="city"
                value={form.city}
                onChange={handleFormChange}
                placeholder="Cidade"
                required
                className="h-11 w-full rounded-lg border px-3 text-sm"
                style={{
                  backgroundColor: "var(--color-bg)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
              />

              <input
                name="reference"
                value={form.reference}
                onChange={handleFormChange}
                placeholder="Ponto de referência (opcional)"
                className="h-11 w-full rounded-lg border px-3 text-sm"
                style={{
                  backgroundColor: "var(--color-bg)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
              />

              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="rounded-lg border px-4 py-2 text-sm font-semibold"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-text)",
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={savingAddress}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  {savingAddress && (
                    <LoaderCircle size={16} className="animate-spin" />
                  )}
                  Salvar endereço
                </button>
              </div>
            </form>
          )}
        </div>

        <div>
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <CreditCard size={18} style={{ color: "var(--color-primary)" }} />
            Forma de pagamento
          </h3>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PAYMENT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPaymentMethod(option.value)}
                className="rounded-xl border p-3 text-sm font-semibold transition"
                style={{
                  backgroundColor:
                    paymentMethod === option.value
                      ? "var(--color-surface-muted)"
                      : "transparent",
                  borderColor:
                    paymentMethod === option.value
                      ? "var(--color-primary)"
                      : "var(--color-border)",
                  color: "var(--color-text)",
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleCheckout}
          disabled={
            finishingOrder ||
            cartCount === 0 ||
            !selectedAddressId ||
            loadingAddresses
          }
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          {finishingOrder ? (
            <>
              <LoaderCircle size={19} className="animate-spin" />
              Finalizando pedido...
            </>
          ) : (
            <>
              <ShoppingBag size={19} />
              Confirmar pedido
            </>
          )}
        </button>
      </div>
    </section>
  );
}
