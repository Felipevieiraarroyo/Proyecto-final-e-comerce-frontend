import api from "./api";

export type PaymentMethod = "DINHEIRO" | "TARJETA" | "PIX" | "QR";

export interface CreateSaleItem {
  productId: number;
  quantity: number;
}

export interface CreateSaleRequest {
  cashRegisterId: number;
  items: CreateSaleItem[];
  paymentAmount: number;
  paymentMethod: PaymentMethod;
}

export interface SaleProduct {
  id: number;
  name: string;
}

export interface SaleItem {
  id: number;
  saleId: number;
  productId: number;
  quantity: number;
  unitPrice: number | string;
  subtotal: number | string;
  product?: SaleProduct;
}

export interface SalePayment {
  id: number;
  saleId: number | null;
  amount: number | string;
  method: PaymentMethod;
  status: "COMPLETO" | "PENDENTE" | "FALHOU";
  createdAt: string;
}

export interface SaleCashRegister {
  id: number;
  userId: number;
  openedAt: string;
  closedAt: string | null;
  status: "OPEN" | "CLOSED";
}

export interface Sale {
  id: number;
  cashRegisterId: number;
  total: number | string;
  createdAt: string;
  items: SaleItem[];
  payments?: SalePayment[];
  cashRegister?: SaleCashRegister;
}

export async function createSale(dados: CreateSaleRequest): Promise<Sale> {
  const response = await api.post<Sale>("/sales", dados);
  return response.data;
}

export async function getSales(): Promise<Sale[]> {
  const response = await api.get<Sale[]>("/sales");
  return response.data;
}
