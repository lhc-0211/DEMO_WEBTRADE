import axios from "axios";
import { store } from "../store";
import { setSessionExpired } from "../store/slices/client/slice";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor thêm config
apiClient.interceptors.request.use((config) => {
  // const token = localStorage.getItem("token");
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }

  const sessionId = localStorage.getItem("sessionId");

  if (sessionId) {
    config.headers["X-Session-ID"] = sessionId;
  }
  return config;
});

// Xử lý response
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // TODO: Logout
      // store.dispatch(logout());
      store.dispatch(setSessionExpired(true));
    }
    return Promise.reject(err);
  }
);

// Abort controller
export const createAbortSignal = () => {
  const controller = new AbortController();
  return { signal: controller.signal, cancel: () => controller.abort() };
};
