import { User } from "src/app/auth/interfaces/user.interfase";

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
  tags:          string[];
  deleteAt:      null;
  imagesName:    string[];
  user:          User;
}
