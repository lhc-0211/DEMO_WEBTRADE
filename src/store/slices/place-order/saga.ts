import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { call, put, takeLatest } from "redux-saga/effects";
import {
  fetchOrdersApi,
  fetchOrdersInday,
  fetchShareCodeApi,
  fetchShareStockApi,
} from "../../../api/placeOrder";
import { showToast } from "../../../hooks/useToast";
import type {
  FetchOrdersIndayParams,
  FetchOrdersIndayResponse,
  FetchOrdersResponse,
  FetchShareCodeResponse,
  FetchShareStockResponse,
  OrderActionPayload,
} from "../../../types/placeOrder";
import {
  fetchListOrdersIndayFailure,
  fetchListOrdersIndayRequest,
  fetchListOrdersIndaySuccess,
  fetchListShareStockFailure,
  fetchListShareStockRequest,
  fetchListShareStockSuccess,
  fetchOrdersFailure,
  fetchOrdersRequest,
  fetchOrdersSuccess,
  fetchShareStockCodeFailure,
  fetchShareStockCodeRequest,
  fetchShareStockCodeSuccess,
} from "./slice";

function* fetchShareStockCodeSaga(
  action: PayloadAction<{ shareCode: string; volume: number }>
) {
  try {
    const res: FetchShareCodeResponse = yield call(
      fetchShareCodeApi,
      action.payload.shareCode,
      action.payload.volume
    );

    if (res.rc < 1) {
      showToast(res.msg || "Thất bại", "error");

      put(fetchShareStockCodeFailure(res.msg || "Thất bại"));
      throw Error(res.msg || "Thất bại");
    }

    yield put(fetchShareStockCodeSuccess(res.data));
  } catch (error: unknown) {
    let errorMessage = "Failed to fetch info index";

    if (axios.isAxiosError(error)) {
      // Nếu server trả về JSON chứa msg
      errorMessage = error.response?.data?.msg || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    showToast(errorMessage, "error");
    yield put(fetchShareStockCodeFailure(errorMessage));
  }
}

function* fetchListShareStockSaga() {
  try {
    const res: FetchShareStockResponse = yield call(fetchShareStockApi);

    if (res.rc < 1) {
      showToast(res.msg || "Thất bại", "error");
      put(fetchListShareStockFailure(res.msg || "Thất bại"));
      throw Error(res.msg || "Thất bại");
    }

    yield put(fetchListShareStockSuccess(res.data));
  } catch (error: unknown) {
    let errorMessage = "Failed to fetch info index";

    if (axios.isAxiosError(error)) {
      // Nếu server trả về JSON chứa msg
      errorMessage = error.response?.data?.msg || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    showToast(errorMessage, "error");
    yield put(fetchListShareStockFailure(errorMessage));
  }
}

function* fetchOrdersSaga(action: PayloadAction<OrderActionPayload>) {
  try {
    const { side, params } = action.payload;
    const res: FetchOrdersResponse = yield call(fetchOrdersApi, side, params);

    if (res.rc < 1) {
      showToast(res.msg || "Thất bại", "error");
      console.log(res);
      yield put(fetchOrdersFailure(res.msg || "Thất bại"));
      throw new Error(res.msg || "Thất bại");
    }

    yield put(fetchOrdersSuccess());
  } catch (error: unknown) {
    let errorMessage = "Failed to fetch info index";

    if (axios.isAxiosError(error)) {
      // Nếu server trả về JSON chứa msg
      errorMessage = error.response?.data?.msg || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    showToast(errorMessage, "error");
    yield put(fetchOrdersFailure(errorMessage));
  }
}

function* fetchListOrdersIndaySaga(
  action: PayloadAction<FetchOrdersIndayParams>
) {
  try {
    const res: FetchOrdersIndayResponse = yield call(
      fetchOrdersInday,
      action.payload
    );

    if (res.rc < 1) {
      showToast(res.msg || "Thất bại", "error");
      put(fetchListOrdersIndayFailure(res.msg || "Thất bại"));
      throw Error(res.msg || "Thất bại");
    }

    yield put(fetchListOrdersIndaySuccess(res.data));
  } catch (error: unknown) {
    let errorMessage = "Failed to fetch info index";

    if (axios.isAxiosError(error)) {
      // Nếu server trả về JSON chứa msg
      errorMessage = error.response?.data?.msg || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    showToast(errorMessage, "error");
    yield put(fetchListOrdersIndayFailure(errorMessage));
  }
}

export default function* placeOrderSaga() {
  yield takeLatest(fetchShareStockCodeRequest, fetchShareStockCodeSaga);
  yield takeLatest(fetchListShareStockRequest, fetchListShareStockSaga);
  yield takeLatest(fetchOrdersRequest, fetchOrdersSaga);
  yield takeLatest(fetchListOrdersIndayRequest, fetchListOrdersIndaySaga);
}
