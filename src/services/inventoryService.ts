import api from "./api";

export interface InventoryProduct {
  id: number;
  name: string;
  salePrice: number | string;
}

export interface InventoryItem {
  id: number;
  productId: number;
  quantity: number;
  product: InventoryProduct;
}

export async function getInventory(): Promise<InventoryItem[]> {
  const response = await api.get<InventoryItem[]>("/inventory");
  return response.data;
}

export async function updateInventory(
  productId: number,
  quantity: number,
): Promise<InventoryItem> {
  const response = await api.patch<InventoryItem>(`/inventory/${productId}`, {
    quantity,
  });
  return response.data;
}
