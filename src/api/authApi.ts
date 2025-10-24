import { apiClient } from "../services/apiClient";
import type {
  FetchOtpPayload,
  FetchOtpResponse,
  LoginPayload,
  LoginResponse,
} from "../types";

export async function loginApi({
  user,
  password,
  device,
  channel,
}: LoginPayload): Promise<LoginResponse["data"]> {
  const payload = {
    user,
    password,
    device,
    channel,
  };
  const res = await apiClient.post<LoginResponse>("/auth/login", payload);
  const { rc, msg, data } = res.data;

  if (rc === 1) {
    localStorage.setItem("sessionId", data.sessionId);
    localStorage.setItem("token", JSON.stringify(data));
    return data;
  } else {
    throw new Error(msg || "Đăng nhập thất bại");
  }
}

export const fetchOtpApi = async (
  payload: FetchOtpPayload
): Promise<FetchOtpResponse> => {
  const res = await apiClient.post<FetchOtpResponse>(
    "/auth/otp/request",
    payload
  );
  return res.data;
};
