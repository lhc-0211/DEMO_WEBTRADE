import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { call, put, takeLatest } from "redux-saga/effects";
import {
  changeNicknameApi,
  checkNicknameApi,
  fetchAccountProfileAPI,
  fetchChangeAccAvaApi,
  fetchChangeAccInfoApi,
} from "../../../api/clientApi";
import { showToast } from "../../../hooks/useToast";
import type {
  AccountProfileResponse,
  ChangeAccountAvaPayload,
  ChangeAccountAvaResponse,
  ChangeAccountInfoActionPayload,
  ChangeAccountInfoResponse,
  ChangeNicknamePayload,
  ChangeNicknameResponse,
} from "../../../types/client";
import {
  fetchAccountProfileFailure,
  fetchAccountProfileRequest,
  fetchAccountProfileSuccess,
  fetchChangeAccountAvaFailure,
  fetchChangeAccountAvaRequest,
  fetchChangeAccountAvaSuccess,
  fetchChangeAccountInfoFailure,
  fetchChangeAccountInfoRequest,
  fetchChangeAccountInfoSuccess,
  fetchChangeNicknameFailure,
  fetchChangeNicknameRequest,
  fetchChangeNicknameSuccess,
  fetchCheckNicknameFailure,
  fetchCheckNicknameRequest,
  fetchCheckNicknameSuccess,
} from "./slice";

function* fetchAccountProfileSaga() {
  try {
    const res: AccountProfileResponse = yield call(fetchAccountProfileAPI);

    if (res.rc < 1) {
      showToast(res.msg || "Thất bại", "error");

      put(fetchAccountProfileFailure(res.msg || "Thất bại"));
      throw Error(res.msg || "Thất bại");
    }

    if (res.data) yield put(fetchAccountProfileSuccess(res.data));
  } catch (error: unknown) {
    let errorMessage = "Failed to fetch info index";

    if (axios.isAxiosError(error)) {
      // Nếu server trả về JSON chứa msg
      errorMessage = error.response?.data?.msg || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    showToast(errorMessage, "error");
    yield put(fetchAccountProfileFailure(errorMessage));
  }
}

function* fetchCheckNicknameSaga(action: PayloadAction<string>) {
  try {
    const res: ChangeNicknameResponse = yield call(
      checkNicknameApi,
      action.payload
    );

    if (res.rc < 1) {
      showToast(res.msg || "Thất bại", "error");

      put(fetchCheckNicknameFailure(res.msg || "Thất bại"));
      throw Error(res.msg || "Thất bại");
    }

    yield put(fetchCheckNicknameSuccess(res.data));
  } catch (error: unknown) {
    let errorMessage = "Failed to fetch info index";

    if (axios.isAxiosError(error)) {
      // Nếu server trả về JSON chứa msg
      errorMessage = error.response?.data?.msg || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    showToast(errorMessage, "error");
    yield put(fetchCheckNicknameFailure(errorMessage));
  }
}

function* fetchChangeNicknameSaga(
  action: PayloadAction<ChangeNicknamePayload>
) {
  try {
    const res: ChangeNicknameResponse = yield call(
      changeNicknameApi,
      action.payload
    );

    if (res.rc < 1) {
      showToast(res.msg || "Thất bại", "error");

      yield put(fetchChangeNicknameFailure(res.msg || "Thất bại"));
      throw Error(res.msg || "Thất bại");
    }

    yield put(fetchChangeNicknameSuccess());
  } catch (error: unknown) {
    let errorMessage = "Failed to fetch info index";

    if (axios.isAxiosError(error)) {
      // Nếu server trả về JSON chứa msg
      errorMessage = error.response?.data?.msg || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    showToast(errorMessage, "error");
    yield put(fetchChangeNicknameFailure(errorMessage));
  }
}

function* fetchChangeAccountInfoSaga(
  action: PayloadAction<ChangeAccountInfoActionPayload>
) {
  try {
    const { otp, ...payload } = action.payload;

    const res: ChangeAccountInfoResponse = yield call(
      fetchChangeAccInfoApi,
      payload,
      otp
    );

    if (res.rc < 1) {
      showToast(res.msg || "Thất bại", "error");
      yield put(fetchChangeAccountInfoFailure(res.msg || "Thất bại"));
      throw Error(res.msg || "Thất bại");
    }
    yield put(fetchChangeAccountInfoSuccess());
  } catch (error: unknown) {
    let errorMessage = "Failed to fetch info index";

    if (axios.isAxiosError(error)) {
      // Nếu server trả về JSON chứa msg
      errorMessage = error.response?.data?.msg || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    showToast(errorMessage, "error");
    yield put(fetchChangeAccountInfoFailure(errorMessage));
  }
}

function* fetchChangeAccountAvaSaga(
  action: PayloadAction<ChangeAccountAvaPayload>
) {
  try {
    const res: ChangeAccountAvaResponse = yield call(
      fetchChangeAccAvaApi,
      action.payload
    );

    if (res.rc < 1) {
      showToast(res.msg || "Thất bại", "error");
      yield put(fetchChangeAccountAvaFailure(res.msg || "Thất bại"));
      throw Error(res.msg || "Thất bại");
    }
    yield put(fetchChangeAccountAvaSuccess());
  } catch (error: unknown) {
    let errorMessage = "Failed to fetch info index";

    if (axios.isAxiosError(error)) {
      // Nếu server trả về JSON chứa msg
      errorMessage = error.response?.data?.msg || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    showToast(errorMessage, "error");
    yield put(fetchChangeAccountAvaFailure(errorMessage));
  }
}

export default function* clientSaga() {
  yield takeLatest(fetchAccountProfileRequest, fetchAccountProfileSaga);
  yield takeLatest(fetchCheckNicknameRequest, fetchCheckNicknameSaga);
  yield takeLatest(fetchChangeNicknameRequest, fetchChangeNicknameSaga);
  yield takeLatest(fetchChangeAccountInfoRequest, fetchChangeAccountInfoSaga);
  yield takeLatest(fetchChangeAccountAvaRequest, fetchChangeAccountAvaSaga);
}
