import { apiClient } from "../services/apiClient";
import type {
  AccountProfileResponse,
  ChangeAccountAvaPayload,
  ChangeAccountAvaResponse,
  ChangeAccountInfoPayload,
  ChangeAccountInfoResponse,
  ChangeNicknamePayload,
  ChangeNicknameResponse,
  DeleteBeneficiaryPayload,
  DeleteBeneficiaryResponse,
  ListBank,
  UpdateBeneficiaryPayload,
  UpdateBeneficiaryResponse,
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

export const fetchChangeAccAvaApi = async (
  params: ChangeAccountAvaPayload
): Promise<ChangeAccountAvaResponse> => {
  const res = await apiClient.put<ChangeAccountAvaResponse>(
    "/accounts/changeAvatar",
    params
  );

  return res.data;
};

// === List bank API ===
export async function fetchListBankApi(): Promise<ListBank> {
  const res = await apiClient.get("/accounts/listBank");

  return res.data;
}

// === Thêm mới tài khoản thụ hưởng ===
export const fetchUpdateBeneficiaryApi = async (
  params: UpdateBeneficiaryPayload,
  otp?: string
): Promise<UpdateBeneficiaryResponse> => {
  const headers = otp ? { "X-Otp": otp } : undefined;

  const res = await apiClient.post<UpdateBeneficiaryResponse>(
    "/accounts/updateBeneficiary",
    params,
    { headers }
  );

  return res.data;
};

// === List account ben ===
export async function fetchListBeneficiaryApi(): Promise<UpdateBeneficiaryResponse> {
  const res = await apiClient.get("/accounts/listBeneficiary");

  return res.data;
}

// ==== Xóa tài khoản thụ hưởng =====
export const fetchDeleteBeneficiaryApi = async (
  params: DeleteBeneficiaryPayload,
  otp?: string
): Promise<DeleteBeneficiaryResponse> => {
  const headers = otp ? { "X-Otp": otp } : undefined;

  const res = await apiClient.delete<DeleteBeneficiaryResponse>(
    "/accounts/deleteBeneficiary",
    {
      headers,
      data: params,
    }
  );

  return res.data;
};
