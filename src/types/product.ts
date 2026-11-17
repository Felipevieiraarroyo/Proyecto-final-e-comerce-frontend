export interface ProductCategory {
  id: number;
  name: string;
}

export interface ProductInventory {
  id: number;
  productId: number;
  quantity: number;
}

export interface Product {
  id: number;
  categoryId: number;
  name: string;
  description: string | null;
  acquisitionPrice: number | string;
  salePrice: number | string;
  category: ProductCategory;
  inventory: ProductInventory | null;
}
