export interface LoginPayload {
  user: string;
  password: string;
  device: string;
  channel: string;
}

export interface LoginResponse {
  rc: number;
  msg: string;
  data: {
    sessionId: string;
    cAccountCode: string;
    cUserCode: string;
    cAccountName: string;
    cCustomerCode: string;
    cAuthenFlag: string;
    cResetFlag: number;
    cCountLogin: number;
    cAuthenType: string;
    cListFunc: string;
    cSerialNumber: string;
    cCountDay: number | null;
  };
}

export type Token = LoginResponse["data"] | null;

export interface FetchOtpPayload {
  channel: string;
}

export interface ConfirmOtpForm {
  otp: string;
}

export interface FetchOtpResponse {
  rc: number;
  msg: string | null;
  data?: {
    otp: string;
  };
}

export type FetchOtpDataResponse = FetchOtpResponse["data"];

export interface ForgotAccountForm {
  accountCode: string;
  cardId: string;
  password: string;
  passwordConfirm: string;
}
