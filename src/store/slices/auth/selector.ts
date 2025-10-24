import type { RootState } from "../..";
import type { ApiStatus, Token } from "../../../types";

export const selectToken = (state: RootState): Token => state.auth.data.token;

export const selectFetchTokenStatus = (state: RootState): ApiStatus =>
  state.auth.status.fetchToken;

export const selectIsAuthenticated = (state: RootState): boolean =>
  !!state.auth.data.token;
