import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchListStockByIdAPI } from "../../../api/priceBoardApi";
import type { ListStockByIdResponse } from "../../../types";

export const fetchListStockById = createAsyncThunk<
  string[],
  string,
  { rejectValue: string }
>("priceBoard/fetchListStockById", async (groupId, { rejectWithValue }) => {
  try {
    console.log("groupId", groupId);

    const response: ListStockByIdResponse = await fetchListStockByIdAPI(
      groupId
    );
    return response.symbols;
  } catch (error) {
    if (error instanceof Error) return rejectWithValue(error.message);
    return rejectWithValue("Failed to fetch listStockById");
  }
});
