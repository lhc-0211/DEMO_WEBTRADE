import type { RootState } from "../..";
import type { ApiStatus } from "../../../types";
import type {
  AccountProfile,
  CheckNicknameDataResponse,
} from "../../../types/client";

export const selectLoginModalOpen = (state: RootState): boolean =>
  state.client.data.loginModalOpen;

export const selectForgotAccountModalOpen = (state: RootState): boolean =>
  state.client.data.forgotAccountModalOpen;

export const selectAccountProfile = (state: RootState): AccountProfile | null =>
  state.client.data.accountProfile;

export const selectSessionExpired = (state: RootState): boolean | null =>
  state.client.data.sessionExpired;

export const selectAccountProfileStatus = (state: RootState): ApiStatus =>
  state.client.status.fetchAccountProfile;

export const selectChangeNicknameStatus = (state: RootState): ApiStatus =>
  state.client.status.fetchChangeNickname;

export const selectCheckNicknameStatus = (state: RootState): ApiStatus =>
  state.client.status.fetchCheckNickname;

export const selectCheckNickname = (
  state: RootState
): CheckNicknameDataResponse | null => state.client.data.checkNickname;

export const selectFectchAccountInfoStatus = (state: RootState): ApiStatus =>
  state.client.status.fetchChangeAccountInfo;

export const selectFectchAccountAvaStatus = (state: RootState): ApiStatus =>
  state.client.status.fetchChangeAccountAva;
