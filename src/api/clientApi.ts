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
  params: Pick<ChangeNicknamePayload, "NICK_NAME">
): Promise<ChangeNicknameResponse> => {
  const res = await apiClient.put<ChangeNicknameResponse>(
    "/accounts/changeNickname",
    params
  );
  return res.data;
};

export const checkNicknameApi = async (
  params: string
): Promise<ChangeNicknameResponse> => {
  const res = await apiClient.get<ChangeNicknameResponse>(
    `/accounts/checkNickname?nickName=${params}`
  );
  return res.data;
};

export const fetchChangeAccInfoApi = async (
  params: ChangeAccountInfoPayload,
  otp: string
): Promise<ChangeAccountInfoResponse> => {
  const res = await apiClient.put<ChangeAccountInfoResponse>(
    "/accounts/change",
    params,
    {
      headers: {
        "X-Otp": otp,
      },
    }
  );

  return res.data;
};
