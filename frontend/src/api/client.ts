import axios, { type InternalAxiosRequestConfig } from "axios";

type RetriableConfig = InternalAxiosRequestConfig & { __retried?: boolean };

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api",
  withCredentials: true,
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
