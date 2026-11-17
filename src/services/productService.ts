import api from "./api";
import type { Product } from "../types/product";

export interface CreateProductData {
  categoryId: number;
  name: string;
  description?: string;
  acquisitionPrice: number;
  salePrice: number;
}

export type UpdateProductData = Partial<CreateProductData>;

export async function getProducts(): Promise<Product[]> {
  const response = await api.get<Product[]>("/products");
  return response.data;
}

export async function createProduct(data: CreateProductData): Promise<Product> {
  const response = await api.post<Product>("/products", data);
  return response.data;
}

export async function updateProduct(
  id: number,
  data: UpdateProductData,
): Promise<Product> {
  const response = await api.patch<Product>(`/products/${id}`, data);
  return response.data;
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/products/${id}`);
}
