import { User } from "@store-front/users/interfaces/user.interfase";
import { Category } from "src/app/categories/interfaces/category.interface";

export interface ProductResponse {
  count:    number;
  pages:    number;
  products: Product[];
}

export interface Product {
  id:            string;
  title:         string;
  price:         number;
  description:   string;
  slug:          string;
  stock:         number;
  isFeatured?:   boolean;
  tags:          Array<{ id: string; name: string }> | string[];
  deleteAt:      null;
  images?:       Array<string | Record<string, any>>;
  imageIds?:     string[];
  category?:     Category;
  user:          User;
}
