import axios, { type InternalAxiosRequestConfig } from "axios";

type RetriableConfig = InternalAxiosRequestConfig & { __retried?: boolean };

export const apiBaseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

export const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const rawAuth = window.localStorage.getItem("citeiq.auth");
  if (rawAuth) {
    try {
      const auth = JSON.parse(rawAuth) as { access_token?: string };
      if (auth.access_token) {
        config.headers.Authorization = `Bearer ${auth.access_token}`;
      }
    } catch {
      window.localStorage.removeItem("citeiq.auth");
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as RetriableConfig | undefined;
    if (error.response?.status === 401 && config && !config.__retried) {
      config.__retried = true;
      await api.post("/auth/refresh");
      return api.request(config);
    }
    return Promise.reject(error);
  },
);
