import { User } from "@store-front/users/interfaces/user.interfase";

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
  images?:       string[];
  user:          User;
}
