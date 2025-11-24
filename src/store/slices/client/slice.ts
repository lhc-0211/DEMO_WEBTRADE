import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ApiStatus } from "../../../types";
import type {
  AccountProfile,
  BankDetail,
  Beneficiary,
  ChangeAccountAvaPayload,
  ChangeAccountInfoActionPayload,
  ChangeNicknameDataResponse,
  ChangeNicknamePayload,
  DeleteBeneficiaryActionPayload,
  UpdateBeneficiaryActionPayload,
} from "../../../types/client";

export interface ClientState {
  data: {
    loginModalOpen: boolean;
    forgotAccountModalOpen: boolean;
    accountProfile: AccountProfile | null;
    sessionExpired: boolean;
    checkNickname: ChangeNicknameDataResponse | null;
    listBank: BankDetail[];
    listBeneficiary: Beneficiary[];
  };
  status: {
    fetchAccountProfile: ApiStatus;
    fetchChangeNickname: ApiStatus;
    fetchCheckNickname: ApiStatus;
    fetchChangeAccountInfo: ApiStatus;
    fetchChangeAccountAva: ApiStatus;
    fetchListBank: ApiStatus;
    fetchUpdateBeneficiary: ApiStatus;
    fetchDeleteBeneficiary: ApiStatus;
    fetchListBeneficiary: ApiStatus;
  };
}

const initialState: ClientState = {
  data: {
    loginModalOpen: false,
    forgotAccountModalOpen: false,
    accountProfile: null,
    sessionExpired: false,
    checkNickname: null,
    listBank: [],
    listBeneficiary: [],
  },
  status: {
    fetchAccountProfile: { loading: false, error: null },
    fetchChangeNickname: { loading: false, error: null, success: false },
    fetchCheckNickname: { loading: false, error: null },
    fetchChangeAccountInfo: { loading: false, error: null, success: false },
    fetchChangeAccountAva: { loading: false, error: null, success: false },
    fetchListBank: { loading: false, error: null },
    fetchUpdateBeneficiary: { loading: false, error: null, success: false },
    fetchDeleteBeneficiary: { loading: false, error: null, success: false },
    fetchListBeneficiary: { loading: false, error: null },
  },
};

const clientSlice = createSlice({
  name: "client",
  initialState,
  reducers: {
    openLoginModal: (state) => {
      state.data.loginModalOpen = true;
    },
    closeLoginModal: (state) => {
      state.data.loginModalOpen = false;
    },

    openForgotAccountModal: (state) => {
      state.data.forgotAccountModalOpen = true;
    },
    closeForgotLoginModal: (state) => {
      state.data.forgotAccountModalOpen = false;
    },

    //Hiện modal phiên đăng nhập
    setSessionExpired: (state, action: PayloadAction<boolean>) => {
      state.data.sessionExpired = action.payload;
    },

    // Thông tin tài khoản
    fetchAccountProfileRequest(state) {
      state.status.fetchAccountProfile = { loading: true, error: null };
      state.data.accountProfile = null;
    },
    fetchAccountProfileSuccess(state, action: PayloadAction<AccountProfile>) {
      state.status.fetchAccountProfile = { loading: false, error: null };
      state.data.accountProfile = action.payload;
    },
    fetchAccountProfileFailure(state, action: PayloadAction<string>) {
      state.status.fetchAccountProfile = {
        loading: false,
        error: action.payload,
      };
      state.data.accountProfile = null;
    },

    //Check nickname
    fetchCheckNicknameRequest(state, action: PayloadAction<string>) {
      state.status.fetchCheckNickname = { loading: true, error: null };
      state.data.checkNickname = null;
    },
    fetchCheckNicknameSuccess(
      state,
      action: PayloadAction<ChangeNicknameDataResponse | null>
    ) {
      state.status.fetchCheckNickname = { loading: false, error: null };
      state.data.checkNickname = action.payload;
    },
    fetchCheckNicknameFailure(state, action: PayloadAction<string>) {
      state.status.fetchCheckNickname = {
        loading: false,
        error: action.payload,
      };
      state.data.checkNickname = null;
    },

    //Đổi nickname
    fetchChangeNicknameRequest: (
      state,
      action: PayloadAction<ChangeNicknamePayload>
    ) => {
      state.status.fetchChangeNickname.loading = true;
      state.status.fetchChangeNickname.error = null;
      state.status.fetchChangeNickname.success = false;
    },
    fetchChangeNicknameSuccess: (state) => {
      state.status.fetchChangeNickname.loading = false;
      state.status.fetchChangeNickname.success = true;
    },
    fetchChangeNicknameFailure: (state, action: PayloadAction<string>) => {
      state.status.fetchChangeNickname.loading = false;
      state.status.fetchChangeNickname.error = action.payload;
      state.status.fetchChangeNickname.success = false;
    },
    resetFetchChangeNickname: (state) => {
      state.status.fetchChangeNickname = {
        loading: false,
        success: false,
        error: null,
      };
    },

    //Đổi thông tin tài khoản
    fetchChangeAccountInfoRequest: (
      state,
      action: PayloadAction<ChangeAccountInfoActionPayload>
    ) => {
      state.status.fetchChangeAccountInfo = {
        loading: true,
        error: null,
        success: false,
      };
    },
    fetchChangeAccountInfoSuccess: (state) => {
      state.status.fetchChangeAccountInfo = {
        loading: false,
        error: null,
        success: true,
      };
    },
    fetchChangeAccountInfoFailure: (state, action: PayloadAction<string>) => {
      state.status.fetchChangeAccountInfo = {
        loading: false,
        error: action.payload,
        success: false,
      };
    },
    resetFetchChangeAccountInfo: (state) => {
      state.status.fetchChangeAccountInfo = {
        loading: false,
        success: false,
        error: null,
      };
    },

    //Đổi thông ava tài khoản
    fetchChangeAccountAvaRequest: (
      state,
      action: PayloadAction<ChangeAccountAvaPayload>
    ) => {
      state.status.fetchChangeAccountAva = {
        loading: true,
        error: null,
        success: false,
      };
    },
    fetchChangeAccountAvaSuccess: (state) => {
      state.status.fetchChangeAccountAva = {
        loading: false,
        error: null,
        success: true,
      };
    },
    fetchChangeAccountAvaFailure: (state, action: PayloadAction<string>) => {
      state.status.fetchChangeAccountAva = {
        loading: false,
        error: action.payload,
        success: false,
      };
    },
    resetFetchChangeAccountAva: (state) => {
      state.status.fetchChangeAccountAva = {
        loading: false,
        success: false,
        error: null,
      };
    },

    // list ngân hàng
    fetchListBankRequest: (state) => {
      state.status.fetchListBank = { loading: true, error: null };
      state.data.listBank = [];
    },
    fetchListBankSuccess: (state, action: PayloadAction<BankDetail[]>) => {
      state.status.fetchListBank = { loading: false, error: null };
      state.data.listBank = action.payload;
    },
    fetchListBankFailure: (state, action: PayloadAction<string>) => {
      state.status.fetchListBank = {
        loading: false,
        error: action.payload,
      };
      state.data.listBank = [];
    },

    // list tài khoản thụ hưởng
    fetchListBeneficiaryRequest: (state) => {
      state.status.fetchListBeneficiary = { loading: true, error: null };
      state.data.listBeneficiary = [];
    },
    fetchListBeneficiarySuccess: (
      state,
      action: PayloadAction<Beneficiary[]>
    ) => {
      state.status.fetchListBeneficiary = { loading: false, error: null };
      state.data.listBeneficiary = action.payload;
    },
    fetchListBeneficiaryFailure: (state, action: PayloadAction<string>) => {
      state.status.fetchListBeneficiary = {
        loading: false,
        error: action.payload,
      };
      state.data.listBeneficiary = [];
    },

    // thêm ngân hàng
    fetchUpdateBeneficiaryRequest: (
      state,
      action: PayloadAction<UpdateBeneficiaryActionPayload>
    ) => {
      state.status.fetchUpdateBeneficiary = {
        loading: true,
        error: null,
        success: false,
      };
    },
    fetchUpdateBeneficiarySuccess: (state) => {
      state.status.fetchUpdateBeneficiary = {
        loading: false,
        error: null,
        success: true,
      };
    },
    fetchUpdateBeneficiaryFailure: (state, action: PayloadAction<string>) => {
      state.status.fetchUpdateBeneficiary = {
        loading: false,
        error: action.payload,
        success: false,
      };
    },
    resetFetchUpdateBeneficiary: (state) => {
      state.status.fetchUpdateBeneficiary = {
        loading: false,
        success: false,
        error: null,
      };
    },

    // xóa ngân hàng
    fetchDeleteBeneficiaryRequest: (
      state,
      action: PayloadAction<DeleteBeneficiaryActionPayload>
    ) => {
      state.status.fetchDeleteBeneficiary = {
        loading: true,
        error: null,
        success: false,
      };
    },
    fetchDeleteBeneficiarySuccess: (state) => {
      state.status.fetchDeleteBeneficiary = {
        loading: false,
        error: null,
        success: true,
      };
    },
    fetchDeleteBeneficiaryFailure: (state, action: PayloadAction<string>) => {
      state.status.fetchDeleteBeneficiary = {
        loading: false,
        error: action.payload,
        success: false,
      };
    },
    resetFetchDeleteAccountBen: (state) => {
      state.status.fetchDeleteBeneficiary = {
        loading: false,
        success: false,
        error: null,
      };
    },
  },
});

export const {
  openLoginModal,

  closeLoginModal,

  openForgotAccountModal,

  closeForgotLoginModal,

  setSessionExpired,

  fetchAccountProfileRequest,
  fetchAccountProfileSuccess,
  fetchAccountProfileFailure,

  fetchCheckNicknameRequest,
  fetchCheckNicknameSuccess,
  fetchCheckNicknameFailure,

  fetchChangeNicknameRequest,
  fetchChangeNicknameSuccess,
  fetchChangeNicknameFailure,
  resetFetchChangeNickname,

  fetchChangeAccountInfoRequest,
  fetchChangeAccountInfoSuccess,
  fetchChangeAccountInfoFailure,
  resetFetchChangeAccountInfo,

  fetchChangeAccountAvaRequest,
  fetchChangeAccountAvaSuccess,
  fetchChangeAccountAvaFailure,
  resetFetchChangeAccountAva,

  fetchListBankRequest,
  fetchListBankSuccess,
  fetchListBankFailure,

  fetchUpdateBeneficiaryRequest,
  fetchUpdateBeneficiarySuccess,
  fetchUpdateBeneficiaryFailure,
  resetFetchUpdateBeneficiary,

  fetchDeleteBeneficiaryRequest,
  fetchDeleteBeneficiarySuccess,
  fetchDeleteBeneficiaryFailure,
  resetFetchDeleteAccountBen,

  fetchListBeneficiaryRequest,
  fetchListBeneficiarySuccess,
  fetchListBeneficiaryFailure,
} = clientSlice.actions;
export default clientSlice.reducer;
