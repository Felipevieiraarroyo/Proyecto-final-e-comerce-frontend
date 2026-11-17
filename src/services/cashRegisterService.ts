import api from "./api";

export interface CashRegister {
  id: number;
  userId: number;
  openingAmount: number | string;
  closingAmount: number | string | null;
  status: "OPEN" | "CLOSED";
  openedAt: string;
  closedAt: string | null;
}

export interface CashReconciliation {
  openingAmount: number;
  salesTotal: number;
  expectedAmount: number;
  closingAmount: number;
  difference: number;
}

export interface CloseCashRegisterResponse {
  cashRegister: CashRegister;
  reconciliation: CashReconciliation;
}

export async function getOpenCashRegister() {
  const response = await api.get<CashRegister | null>("/cash-register/open");

  return response.data;
}

export async function openCashRegister(openingAmount: number) {
  const response = await api.post<CashRegister>("/cash-register/open", {
    openingAmount,
  });

  return response.data;
}

export async function closeCashRegister(id: number, closingAmount: number) {
  const response = await api.patch<CloseCashRegisterResponse>(
    `/cash-register/${id}/close`,
    { closingAmount },
  );

  return response.data;
}
