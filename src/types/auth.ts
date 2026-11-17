export type Role = "ADMIN" | "CAJERO" | "CLIENTE";

export interface Usuario {
  id: number;
  email: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: Usuario;
}
