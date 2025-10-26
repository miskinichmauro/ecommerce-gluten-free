import { User } from "@store-front/users/interfaces/user.interfase";

export interface AuthResponse {
  user:         User;
  access_token: string;
}
