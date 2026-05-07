import axios, { AxiosError } from "axios";

import { API_BASE_URL } from "@/src/api/config";
import { ApiError } from "@/src/api/types";
import { clearToken, getToken } from "@/src/auth/token-storage";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 75000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const isTimeout =
      error.code === "ECONNABORTED" ||
      error.code === "ERR_NETWORK" ||
      !error.response;

    if (isTimeout) {
      return Promise.reject(
        new Error("The server is waking up — please try again in a moment"),
      );
    }

    const status = error.response.status;

    if (status === 401) {
      await clearToken();
      const apiErr = error.response.data;
      return Promise.reject(
        new Error(apiErr?.message ?? "Session expired. Please log in again."),
      );
    }

    if (status === 429) {
      return Promise.reject(
        new Error("Too many requests — please wait a moment and try again"),
      );
    }

    const apiErr = error.response.data;
    return Promise.reject(
      new Error(apiErr?.message ?? `Request failed (${status})`),
    );
  },
);
