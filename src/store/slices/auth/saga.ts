import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import {
  call,
  put,
  takeLatest,
  type CallEffect,
  type ForkEffect,
  type PutEffect,
} from "redux-saga/effects";
import { fetchOtpApi, loginApi } from "../../../api/authApi";
import { showToast } from "../../../hooks/useToast";
import type {
  FetchOtpPayload,
  FetchOtpResponse,
  LoginPayload,
  LoginResponse,
} from "../../../types";
import {
  fetchotpFailure,
  fetchOtpRequest,
  fetchOtpSuccess,
  loginFailure,
  loginRequest,
  loginSuccess,
} from "./slice";

type GeneratorYield = CallEffect | PutEffect | ForkEffect;

function* loginSaga(action: {
  payload: LoginPayload;
}): Generator<GeneratorYield, void, LoginResponse["data"]> {
  try {
    const { user, password, device, channel } = action.payload;
    const tokenData: LoginResponse["data"] = yield call(loginApi, {
      user,
      password,
      device,
      channel,
    });
    yield put(loginSuccess(tokenData));
  } catch (error: unknown) {
    let errorMessage = "Failed to fetch info index";

    if (axios.isAxiosError(error)) {
      // Nếu server trả về JSON chứa msg
      errorMessage = error.response?.data?.msg || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    showToast(errorMessage, "error");
    yield put(loginFailure(errorMessage));
  }
}

function* fetchOtpSaga(action: PayloadAction<FetchOtpPayload>) {
  try {
    const res: FetchOtpResponse = yield call(fetchOtpApi, action.payload);
    if (res.rc === 1) {
      yield put(fetchOtpSuccess(res.data));
    } else {
      yield put(fetchotpFailure(res.msg || "Thất bại"));
    }
  } catch (error: unknown) {
    let errorMessage = "Failed to fetch info index";

    if (axios.isAxiosError(error)) {
      // Nếu server trả về JSON chứa msg
      errorMessage = error.response?.data?.msg || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    showToast(errorMessage, "error");

    yield put(fetchotpFailure(errorMessage));
  }
}

export default function* authSaga(): Generator<GeneratorYield> {
  yield takeLatest(loginRequest, loginSaga);
  yield takeLatest(fetchOtpRequest, fetchOtpSaga);
}
