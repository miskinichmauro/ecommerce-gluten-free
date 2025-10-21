import { Product } from "@products/interfaces/product";

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product?: Product;
}
