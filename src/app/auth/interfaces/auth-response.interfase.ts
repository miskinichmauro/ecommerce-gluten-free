import { User } from "../../users/users/interfaces/user.interfase";

export interface AuthResponse {
  user:         User;
  access_token: string;
}
