export interface ApiClient {
  get: <T = unknown>(url: string, config?: RequestInit) => Promise<T>;
  post: <T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestInit
  ) => Promise<T>;
  put: <T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestInit
  ) => Promise<T>;
  delete: <T = unknown>(url: string, config?: RequestInit) => Promise<T>;
}
