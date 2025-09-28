import { User } from "./user.interfase";

export interface AuthResponse {
  user:         User;
  access_token: string;
}
