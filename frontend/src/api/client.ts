import axios from "axios";
import { toast } from "sonner";

import { useAuthStore } from "../store/authStore";

function getApiBaseUrl(): string {
  const envBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return envBase?.trim() ? envBase.trim().replace(/\/+$/, "") : "";
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 60_000,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status as number | undefined;
    const detail =
      (error?.response?.data?.detail as string | undefined) ??
      (error?.message as string | undefined) ??
      "Something went wrong";

    if (status === 401) {
      useAuthStore.getState().logout();
    }

    toast.error(detail);
    return Promise.reject(error);
  },
);

