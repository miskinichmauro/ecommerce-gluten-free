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
  unitOfMeasure: string;
  description:   string;
  slug:          string;
  stock:         number;
  tags:          Array<{ id: string; name: string }> | string[];
  deleteAt:      null;
  images?:       string[];
  category?:     Category;
  user:          User;
}
