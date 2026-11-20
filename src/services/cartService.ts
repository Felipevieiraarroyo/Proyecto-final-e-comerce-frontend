import api from "./api";

export interface CartProduct {
  id: number;
  name: string;
  description: string | null;
  salePrice: number | string;
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  product: CartProduct;
}

export interface Cart {
  id: number;
  customerId: number;
  items: CartItem[];
}

export interface AddCartItemData {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemData {
  quantity: number;
}

export async function getMyCart(): Promise<Cart> {
  const response = await api.get<Cart>("/carts/me");
  return response.data;
}

export async function addCartItem(data: AddCartItemData): Promise<CartItem> {
  const response = await api.post<CartItem>("/carts/me/items", data);

  return response.data;
}

export async function updateCartItem(
  itemId: number,
  data: UpdateCartItemData,
): Promise<CartItem> {
  const response = await api.patch<CartItem>(`/carts/me/items/${itemId}`, data);

  return response.data;
}

export async function removeCartItem(itemId: number): Promise<void> {
  await api.delete(`/carts/me/items/${itemId}`);
}
