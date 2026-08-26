import axios from "axios";

export const AUTH_EXPIRED_EVENT = "fastweb:auth-expired";

const API_ROOT = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");
const AUTH_ENDPOINTS_WITHOUT_REFRESH = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/refresh",
  "/auth/logout",
];

const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Attach auth token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Track in-flight refresh to avoid duplicate refresh calls
let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (!original) return Promise.reject(error);

    const isAuthEndpoint = AUTH_ENDPOINTS_WITHOUT_REFRESH.some((endpoint) =>
      String(original.url ?? "").includes(endpoint)
    );
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    if (error.response?.status !== 401 || original._retry || isAuthEndpoint || !token) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(
            `${API_ROOT}/api/auth/refresh`,
            {},
            {
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .then((res) => {
            const token: string = res.data.access_token;
            localStorage.setItem("auth_token", token);
            return token;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newToken = await refreshPromise;
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch {
      localStorage.removeItem("auth_token");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
      }
      return Promise.reject(error);
    }
  }
);

export default api;
