import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchListStockByIdAPI } from "../../../api";
import type { ListStockByIdResponse } from "../../../types";

export const fetchListStockById = createAsyncThunk<
  ListStockByIdResponse,
  string,
  { rejectValue: string }
>("priceBoard/fetchListStockById", async (groupId, { rejectWithValue }) => {
  try {
    const response: ListStockByIdResponse = await fetchListStockByIdAPI(
      groupId
    );
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return rejectWithValue(message);
  }
});
