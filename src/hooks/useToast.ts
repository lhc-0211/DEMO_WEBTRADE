import { toast as notify, Slide, type ToastOptions } from "react-toastify";

export type ToastType = "success" | "error" | "info" | "warning";

// Function dùng (saga, API, logic)
export function showToast(
  message: string,
  type: ToastType = "info",
  options?: ToastOptions
) {
  notify[type](message, {
    position: "top-right",
    autoClose: 1000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    transition: Slide,
    theme: "dark",
    ...options,
  });
}

// Custom hook
export function useToast() {
  return (
    message: string,
    type: ToastType = "info",
    options?: ToastOptions
  ) => {
    showToast(message, type, options);
  };
}
