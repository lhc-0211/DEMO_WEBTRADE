import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
import {
  fetchChartIndexAPI,
  fetchInfoIndexAPI,
  fetchTopForeignTradedAPI,
  fetchTopStockTradedAPI,
} from "../../../api/priceBoardApi";
import type {
  ChartIndexItem,
  InfoIndex,
  topForeignTradedItem,
  topStockTradedItem,
} from "../../../types";
import {
  fetchChartIndexFailure,
  fetchChartIndexRequest,
  fetchChartIndexSuccess,
  fetchInfoIndexFailure,
  fetchInfoIndexRequest,
  fetchInfoIndexSuccess,
  fetchTopForeignTradedFailure,
  fetchTopForeignTradedRequest,
  fetchTopForeignTradedSuccess,
  fetchTopStockTradedFailure,
  fetchTopStockTradedRequest,
  fetchTopStockTradedSuccess,
} from "./slice";

// Định nghĩa type cho action saga
interface FetchApiByParamAction {
  type: string;
  payload: string; // id
}

function* fetchInfoIndexSaga() {
  try {
    const response: { data: InfoIndex[] } = yield call(fetchInfoIndexAPI);
    yield put(fetchInfoIndexSuccess(response.data));
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch info index";
    yield put(fetchInfoIndexFailure(errorMessage));
  }
}

function* fetchChartIndexSaga(action: FetchApiByParamAction) {
  try {
    const response: { data: ChartIndexItem[] } = yield call(
      fetchChartIndexAPI,
      action.payload
    );

    yield put(
      fetchChartIndexSuccess({ id: action.payload, data: response.data })
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch info index";
    console.error(`Error fetching ${action.payload}:`, errorMessage); // Log lỗi
    yield put(fetchChartIndexFailure(action.payload)); // Truyền id thay vì errorMessage
  }
}

function* fetchTopStockTradedSaga(action: FetchApiByParamAction) {
  try {
    const response: { data: topStockTradedItem[] } = yield call(
      fetchTopStockTradedAPI,
      action.payload
    );

    yield put(fetchTopStockTradedSuccess(response.data));
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch info index";
    yield put(fetchTopStockTradedFailure(errorMessage));
  }
}

function* fetchTopForeignTradedSaga(action: FetchApiByParamAction) {
  try {
    const response: { data: topForeignTradedItem[] } = yield call(
      fetchTopForeignTradedAPI,
      action.payload
    );

    yield put(fetchTopForeignTradedSuccess(response.data));
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch info index";
    yield put(fetchTopForeignTradedFailure(errorMessage));
  }
}

export default function* priceBoardSaga() {
  yield takeLatest(fetchInfoIndexRequest, fetchInfoIndexSaga);
  yield takeEvery(fetchChartIndexRequest, fetchChartIndexSaga);
  yield takeEvery(fetchTopStockTradedRequest, fetchTopStockTradedSaga);
  yield takeEvery(fetchTopForeignTradedRequest, fetchTopForeignTradedSaga);
}
