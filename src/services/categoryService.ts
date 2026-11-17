import api from "./api";

export interface Category {
  id: number;
  name: string;
  description?: string | null;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
}

export type UpdateCategoryData = Partial<CreateCategoryData>;

export async function getCategories(): Promise<Category[]> {
  const response = await api.get<Category[]>("/categories");
  return response.data;
}

export async function createCategory(
  data: CreateCategoryData,
): Promise<Category> {
  const response = await api.post<Category>("/categories", data);
  return response.data;
}

export async function updateCategory(
  id: number,
  data: UpdateCategoryData,
): Promise<Category> {
  const response = await api.patch<Category>(`/categories/${id}`, data);
  return response.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/categories/${id}`);
}
