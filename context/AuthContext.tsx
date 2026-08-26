"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import api, { AUTH_EXPIRED_EVENT } from "@/lib/axios";
import queryClient from "@/lib/queryClient";
import { clearStoredCart } from "@/context/CartContext";

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  approval_status?: "pending" | "approved" | "rejected";
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Read browser-only auth state after hydration so the first server and client
  // renders always match.
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const storedToken = localStorage.getItem("auth_token");
      if (storedToken) {
        setToken(storedToken);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function clearExpiredSession() {
      localStorage.removeItem("auth_token");
      clearStoredCart();
      setToken(null);
      setUser(null);
      setIsLoading(false);
      queryClient.clear();
    }

    window.addEventListener(AUTH_EXPIRED_EVENT, clearExpiredSession);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, clearExpiredSession);
  }, []);

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
    setIsLoading(false);
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore errors — clear local state regardless
    }
    localStorage.removeItem("auth_token");
    clearStoredCart();
    setToken(null);
    setUser(null);
    queryClient.clear();
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
        // Pending accounts cannot log in according to the API contract. Older
        // API responses do not include approval_status, so an authenticated
        // user is approved unless the API explicitly says otherwise.
        isApproved:
          !!user &&
          user.approval_status !== "pending" &&
          user.approval_status !== "rejected",
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
