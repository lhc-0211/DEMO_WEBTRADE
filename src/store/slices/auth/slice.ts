import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  ApiStatus,
  FetchOtpDataResponse,
  FetchOtpPayload,
  LoginPayload,
  LoginResponse,
  Token,
} from "../../../types";

export interface AuthState {
  data: { token: Token; otp: FetchOtpDataResponse | null };
  status: { fetchToken: ApiStatus; fetchOtp: ApiStatus };
}

const initialState: AuthState = {
  data: {
    token: (() => {
      try {
        const saved = localStorage.getItem("token");
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    })(),
    otp: null,
  },
  status: {
    fetchToken: { loading: false, error: null },
    fetchOtp: { loading: false, error: null },
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginRequest: (state, action: PayloadAction<LoginPayload>) => {
      state.status.fetchToken = { loading: true, error: null };
    },
    loginSuccess: (state, action: PayloadAction<LoginResponse["data"]>) => {
      state.data.token = action.payload;
      state.status.fetchToken = { loading: false, error: null };
      localStorage.setItem("token", JSON.stringify(action.payload));
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.data.token = null;
      state.status.fetchToken = { loading: false, error: action.payload };
    },
    logout: (state) => {
      if (!state.data.token) return;
      state.data.token = null;
      state.status.fetchToken = { loading: false, error: null };
      localStorage.removeItem("token");
      localStorage.removeItem("sessionId");
    },

    //Lấy Otp
    fetchOtpRequest(state, action: PayloadAction<FetchOtpPayload>) {
      state.status.fetchOtp = { loading: true, error: null };
      state.data.otp = null;
    },
    fetchOtpSuccess(state, action: PayloadAction<FetchOtpDataResponse>) {
      state.status.fetchOtp = { loading: false, error: null };
      state.data.otp = action.payload;
    },
    fetchotpFailure(state, action: PayloadAction<string>) {
      state.status.fetchOtp = {
        loading: false,
        error: action.payload,
      };
      state.data.otp = null;
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  logout,
  fetchOtpRequest,
  fetchOtpSuccess,
  fetchotpFailure,
} = authSlice.actions;

export default authSlice.reducer;
