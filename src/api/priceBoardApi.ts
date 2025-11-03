import { apiClient } from "../services/apiClient";
import type { ListStockByIdResponse } from "../types";

export async function fetchListStockByIdAPI(
  id: string
): Promise<ListStockByIdResponse> {
  const res = await apiClient.get(`/priceboard/symbols/${id}`);

  return res.data;
}
