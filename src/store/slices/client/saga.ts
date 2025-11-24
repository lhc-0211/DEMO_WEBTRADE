import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { call, put, takeLatest } from "redux-saga/effects";
import {
  changeNicknameApi,
  checkNicknameApi,
  fetchAccountProfileAPI,
  fetchChangeAccAvaApi,
  fetchChangeAccInfoApi,
  fetchDeleteBeneficiaryApi,
  fetchListBankApi,
  fetchListBeneficiaryApi,
  fetchUpdateBeneficiaryApi,
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
  DeleteBeneficiaryActionPayload,
  DeleteBeneficiaryResponse,
  ListBank,
  ListBeneficiary,
  UpdateBeneficiaryActionPayload,
  UpdateBeneficiaryResponse,
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
  fetchDeleteBeneficiaryFailure,
  fetchDeleteBeneficiaryRequest,
  fetchDeleteBeneficiarySuccess,
  fetchListBankFailure,
  fetchListBankRequest,
  fetchListBankSuccess,
  fetchListBeneficiaryFailure,
  fetchListBeneficiaryRequest,
  fetchListBeneficiarySuccess,
  fetchUpdateBeneficiaryFailure,
  fetchUpdateBeneficiaryRequest,
  fetchUpdateBeneficiarySuccess,
} from "./slice";

function* fetchAccountProfileSaga() {
  try {
    const res: AccountProfileResponse = yield call(fetchAccountProfileAPI);

    if (res.rc < 1) {
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

function* fetchListBankSaga() {
  try {
    const res: ListBank = yield call(fetchListBankApi);

    if (res.rc < 1) {
      put(fetchListBankFailure(res.msg || "Thất bại"));
      throw Error(res.msg || "Thất bại");
    }

    yield put(fetchListBankSuccess(res.data ?? []));
  } catch (error: unknown) {
    let errorMessage = "Failed to fetch info index";

    if (axios.isAxiosError(error)) {
      // Nếu server trả về JSON chứa msg
      errorMessage = error.response?.data?.msg || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    showToast(errorMessage, "error");
    yield put(fetchListBankFailure(errorMessage));
  }
}

function* fetchUpdateBeneficiarySaga(
  action: PayloadAction<UpdateBeneficiaryActionPayload>
) {
  try {
    const { otp, params } = action.payload;

    const res: UpdateBeneficiaryResponse = yield call(
      fetchUpdateBeneficiaryApi,
      params,
      otp
    );

    if (res.rc < 1) {
      yield put(fetchUpdateBeneficiaryFailure(res.msg || "Thất bại"));
      throw Error(res.msg || "Thất bại");
    }

    yield put(fetchUpdateBeneficiarySuccess());
  } catch (error: unknown) {
    let errorMessage = "Failed to fetch info index";

    if (axios.isAxiosError(error)) {
      // Nếu server trả về JSON chứa msg
      errorMessage = error.response?.data?.msg || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    showToast(errorMessage, "error");
    yield put(fetchUpdateBeneficiaryFailure(errorMessage));
  }
}

function* fetchListBeneficiarySaga() {
  try {
    const res: ListBeneficiary = yield call(fetchListBeneficiaryApi);

    if (res.rc < 1) {
      put(fetchListBeneficiaryFailure(res.msg || "Thất bại"));
      throw Error(res.msg || "Thất bại");
    }

    yield put(fetchListBeneficiarySuccess(res.data ?? []));
  } catch (error: unknown) {
    let errorMessage = "Failed to fetch info index";

    if (axios.isAxiosError(error)) {
      // Nếu server trả về JSON chứa msg
      errorMessage = error.response?.data?.msg || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    showToast(errorMessage, "error");
    yield put(fetchListBeneficiaryFailure(errorMessage));
  }
}

function* fetchDeleteBeneficiarySaga(
  action: PayloadAction<DeleteBeneficiaryActionPayload>
) {
  try {
    const { otp, params } = action.payload;

    const res: DeleteBeneficiaryResponse = yield call(
      fetchDeleteBeneficiaryApi,
      params,
      otp
    );

    if (res.rc < 1) {
      yield put(fetchDeleteBeneficiaryFailure(res.msg || "Thất bại"));
      throw Error(res.msg || "Thất bại");
    }

    yield put(fetchDeleteBeneficiarySuccess());
  } catch (error: unknown) {
    let errorMessage = "Failed to fetch info index";

    if (axios.isAxiosError(error)) {
      // Nếu server trả về JSON chứa msg
      errorMessage = error.response?.data?.msg || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    showToast(errorMessage, "error");
    yield put(fetchDeleteBeneficiaryFailure(errorMessage));
  }
}

export default function* clientSaga() {
  yield takeLatest(fetchAccountProfileRequest, fetchAccountProfileSaga);
  yield takeLatest(fetchCheckNicknameRequest, fetchCheckNicknameSaga);
  yield takeLatest(fetchChangeNicknameRequest, fetchChangeNicknameSaga);
  yield takeLatest(fetchChangeAccountInfoRequest, fetchChangeAccountInfoSaga);
  yield takeLatest(fetchChangeAccountAvaRequest, fetchChangeAccountAvaSaga);
  yield takeLatest(fetchListBankRequest, fetchListBankSaga);
  yield takeLatest(fetchUpdateBeneficiaryRequest, fetchUpdateBeneficiarySaga);
  yield takeLatest(fetchListBeneficiaryRequest, fetchListBeneficiarySaga);
  yield takeLatest(fetchDeleteBeneficiaryRequest, fetchDeleteBeneficiarySaga);
}
