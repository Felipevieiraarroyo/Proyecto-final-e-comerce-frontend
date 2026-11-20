export type Role = "ADMIN" | "CAJERO" | "CLIENTE";

export interface Usuario {
  id: number;
  name?: string;
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

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  document: string;
}

export interface RegisterResponse {
  access_token: string;
  user: Usuario;
  customer: {
    id: number;
    phone: string;
    document: string;
  };
}
