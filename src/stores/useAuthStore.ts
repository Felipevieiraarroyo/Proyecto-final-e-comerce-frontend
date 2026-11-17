import { create } from "zustand";
import api from "../services/api";
import type { LoginRequest, LoginResponse, Usuario } from "../types/auth";

interface AuthState {
  token: string | null;
  user: Usuario | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  authChecking: boolean;

  login: (dados: LoginRequest) => Promise<void>;
  carregarUsuario: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  authChecking: true,

  login: async (dados) => {
    set({ loading: true, error: null });

    try {
      const response = await api.post<LoginResponse>("/auth/login", dados);

      const { access_token, user } = response.data;

      localStorage.setItem("token", access_token);

      set({
        token: access_token,
        user,
        isAuthenticated: true,
        error: null,
      });
    } catch (error) {
      set({
        error: "Não foi possível realizar o login.",
        isAuthenticated: false,
      });

      throw error;
    } finally {
      set({ loading: false });
    }
  },

  carregarUsuario: async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        authChecking: false,
      });
      return;
    }

    try {
      const response = await api.get<Usuario>("/auth/me");

      set({
        token,
        user: response.data,
        isAuthenticated: true,
        authChecking: false,
      });
    } catch {
      localStorage.removeItem("token");

      set({
        token: null,
        user: null,
        isAuthenticated: false,
        authChecking: false,
      });
    }
  },

  logout: () => {
    localStorage.removeItem("token");

    set({
      token: null,
      user: null,
      isAuthenticated: false,
      error: null,
      authChecking: false,
    });
  },
}));
