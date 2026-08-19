"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import api from "@/lib/axios";
import queryClient from "@/lib/queryClient";

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  approval_status: "pending" | "approved" | "rejected";
  erp_contact_id?: number | null;
  orders_count?: number;
  prices_visible?: boolean;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isApproved: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredAuthToken);
  const [isLoading, setIsLoading] = useState(() => getStoredAuthToken() !== null);

  // Validate a stored token by fetching the current user.
  useEffect(() => {
    if (!token) return;

    let isCurrent = true;

    api
      .get<User>("/users/me")
      .then((res) => {
        if (isCurrent) setUser(res.data);
      })
      .catch(() => {
        localStorage.removeItem("auth_token");
        if (isCurrent) setToken(null);
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{
      access_token: string;
      user: User;
    }>("/auth/login", { email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem("auth_token", access_token);
    setToken(access_token);
    setUser(userData);
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore errors — clear local state regardless
    }
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }, []);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        isApproved: user?.approval_status === "approved",
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
