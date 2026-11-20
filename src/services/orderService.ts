import api from "./api";

export type PaymentMethod = "DINERO" | "TARJETA" | "PIX" | "QR";

export type OrderStatus =
  | "PENDIENTE"
  | "PAGO"
  | "EN_CAMINO"
  | "ENTREGADO"
  | "CANCELADO";

export type PaymentStatus =
  | "PENDIENTE"
  | "COMPLETO"
  | "FRACASADO"
  | "CANCELADO";

export type OrderSource = "WEB" | "SOCIAL";

export interface CheckoutData {
  addressId: number;
  paymentMethod: PaymentMethod;
}

export interface OrderProduct {
  id: number;
  name: string;
  description?: string | null;
  salePrice?: number | string;
}

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number | string;
  subtotal: number | string;
  product?: OrderProduct;
}

export interface OrderPayment {
  id: number;
  orderId: number;
  amount: number | string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string | null;
  createdAt?: string;
}

export interface OrderCustomer {
  id: number;
  userId: number;
  phone: string;
  document: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface Order {
  id: number;
  customerId: number;
  source: OrderSource;
  status: OrderStatus;
  total: number | string;
  customer?: OrderCustomer;

  shippingStreet: string;
  shippingNumber: string;
  shippingComplement: string | null;
  shippingCity: string;
  shippingReference: string | null;

  createdAt: string;
  updatedAt?: string;

  items: OrderItem[];
  payments?: OrderPayment[];
}

export interface CheckoutResponse {
  order: Order;
  payment: OrderPayment;
  checkoutUrl?: string | null;
}

export async function checkout(data: CheckoutData): Promise<CheckoutResponse> {
  const response = await api.post<CheckoutResponse>("/orders/checkout", data);

  return response.data;
}

export async function getMyOrders(): Promise<Order[]> {
  const response = await api.get<Order[]>("/orders/me");
  return response.data;
}

export async function getMyOrder(id: number): Promise<Order> {
  const response = await api.get<Order>(`/orders/me/${id}`);
  return response.data;
}
export async function getOrders(): Promise<Order[]> {
  const response = await api.get<Order[]>("/orders");
  return response.data;
}

export async function getOrder(id: number): Promise<Order> {
  const response = await api.get<Order>(`/orders/${id}`);
  return response.data;
}

export async function updateOrderStatus(
  id: number,
  status: OrderStatus,
): Promise<Order> {
  const response = await api.patch<Order>(`/orders/${id}/status`, {
    status,
  });

  return response.data;
}
