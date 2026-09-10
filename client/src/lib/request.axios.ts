/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { API_BASE_URL } from "@/hooks/api-urls";
import { store } from "@/store/store";
import { clearUser } from "@/store/slice/userSlice";

export interface ApiErrorResponse {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

export class ApiError extends Error {
  statusCode: number;
  errors?: string[];

  constructor(message: string, statusCode: number = 500, errors?: string[]) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Response interceptor: unwraps data and standardizes error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response) {
      const data = error.response.data;
      const statusCode = error.response.status || data?.statusCode || 500;

      let errorMessage = "An unexpected error occurred";
      let errorList: string[] | undefined = undefined;

      if (data?.message) {
        if (Array.isArray(data.message)) {
          errorList = data.message;
          errorMessage = data.message.join(", ");
        } else if (typeof data.message === "string") {
          errorMessage = data.message;
        }
      } else if (data?.error && typeof data.error === "string") {
        errorMessage = data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Automatically redirect to /login on 401 (Unauthorized) or 403 (Forbidden)
      if (
        (statusCode === 401 || statusCode === 403) &&
        typeof window !== "undefined"
      ) {
        const isAuthEndpoint =
          error.config?.url?.includes("/auth/login") ||
          error.config?.url?.includes("/auth/register");

        const isOnAuthPage =
          window.location.pathname.startsWith("/login") ||
          window.location.pathname.startsWith("/signup");

        if (!isAuthEndpoint && !isOnAuthPage) {
          try {
            store.dispatch(clearUser());
          } catch {
            // In case store is unavailable
          }
          window.location.href = "/login";
        }
      }

      return Promise.reject(new ApiError(errorMessage, statusCode, errorList));
    }

    if (error.request) {
      return Promise.reject(
        new ApiError(
          "Network error: Unable to reach the server. Please check your connection.",
          0,
        ),
      );
    }

    return Promise.reject(
      new ApiError(error.message || "Request initialization error", 500),
    );
  },
);

export const request = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.get(url, config) as Promise<T>,
  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> => apiClient.post(url, data, config) as Promise<T>,
  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> => apiClient.put(url, data, config) as Promise<T>,
  patch: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> => apiClient.patch(url, data, config) as Promise<T>,
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.delete(url, config) as Promise<T>,
  client: apiClient,
};

export default request;
