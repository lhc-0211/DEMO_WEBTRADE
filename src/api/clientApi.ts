import { apiClient } from "../services/apiClient";
import type {
  AccountProfileResponse,
  ChangeAccountInfoPayload,
  ChangeAccountInfoResponse,
  ChangeNicknamePayload,
  ChangeNicknameResponse,
} from "../types/client";

export async function fetchAccountProfileAPI(): Promise<AccountProfileResponse> {
  const res = await apiClient.get("/accounts/profile");

  return res.data;
}

export const changeNicknameApi = async (
  payload: Pick<ChangeNicknamePayload, "NICK_NAME">
): Promise<ChangeNicknameResponse> => {
  const res = await apiClient.put<ChangeNicknameResponse>(
    "/accounts/changeNickname",
    payload
  );
  return res.data;
};

export const checkNicknameApi = async (
  payload: Pick<ChangeNicknamePayload, "NICK_NAME">
): Promise<ChangeNicknameResponse> => {
  const res = await apiClient.request<ChangeNicknameResponse>({
    url: "/accounts/checkNickname",
    method: "GET",
    data: payload,
  });
  return res.data;
};

export const fetchChangeAccInfoApi = async (
  payload: ChangeAccountInfoPayload,
  otp: string
): Promise<ChangeAccountInfoResponse> => {
  const res = await apiClient.put<ChangeAccountInfoResponse>(
    "/accounts/change",
    payload,
    {
      headers: {
        "X-Otp": otp,
      },
    }
  );

  return res.data;
};
