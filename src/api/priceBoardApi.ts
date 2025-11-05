import { apiClient } from "../services/apiClient";
import type { ListStockByIdResponse } from "../types";

export async function fetchListStockByIdAPI(
  id: string
): Promise<ListStockByIdResponse> {
  const res = await apiClient.get(`/evg/groups/list/${id}`);
  return res.data;
}
