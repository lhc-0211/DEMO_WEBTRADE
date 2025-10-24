import { apiClient } from "../services/apiClient";
import type {
  FetchCashBalanceParams,
  FetchCashBalanceResponse,
  FetchOrdersIndayParams,
  FetchOrdersIndayResponse,
  FetchOrdersResponse,
  FetchShareCodeResponse,
  OrderParams,
} from "../types/placeOrder";

export const fetchShareCodeApi = async (
  shareCode: string,
  volume: number
): Promise<FetchShareCodeResponse> => {
  const res = await apiClient.get<FetchShareCodeResponse>(
    `/reference/shares/${shareCode}`,
    {
      params: { volume },
    }
  );
  return res.data;
};

export const fetchShareStockApi = async (): Promise<FetchShareCodeResponse> => {
  const res = await apiClient.get<FetchShareCodeResponse>(`/reference/shares`);
  return res.data;
};

export const fetchOrdersApi = async (
  side: "BUY" | "SELL",
  params: OrderParams
): Promise<FetchOrdersResponse> => {
  const res = await apiClient.post<FetchOrdersResponse>(
    `/orders/${side.toLowerCase()}`,
    params
  );

  return res.data;
};

export const fetchOrdersInday = async (
  params: FetchOrdersIndayParams
): Promise<FetchOrdersIndayResponse> => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.append(key, String(value));
    }
  });

  const res = await apiClient.get<FetchOrdersIndayResponse>(
    `/orders/inday?${query.toString()}`
  );

  return res.data;
};

export const fetchCashBalanceApi = async (
  params: FetchCashBalanceParams
): Promise<FetchCashBalanceResponse> => {
  const res = await apiClient.post<FetchCashBalanceResponse>(
    `/cash/balance`,
    params
  );
  return res.data;
};
