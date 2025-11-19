export interface AccountProfileValue {
  pkCustCustomer: string;
  cBranchCode: string;
  cSubBranchCode: string;
  cMarketingId: string;
  cMktName: string;
  cCustomerCode: string;
  cCardIdType: string;
  cCardId: string;
  cIdIssueDate: string;
  cIdExpireDate: string;
  cIssuePlace: string;
  cIssuePlaceName: string;
  cPolicyCode: string;
  cCommPackage: string;
  cCommName: string;
  cCommRate: number;
  cCustomerType: string;
  cTaxCode: string;
  cNationalCode: string;
  cCustomerName: string;
  cCustGender: string;
  cCustBirthDay: string;
  cVnFlag: number;
  cCustEmail: string;
  cCustMobile: string;
  cCustTel: string;
  cContactAddress: string;
  cResedenceAddress: string;
  cProvinceCode: string;
  cAuthenSign: string;
  cFrontCard: string;
  cBackCard: string;
  cSignImg: string;
  cFaceImg: string;
  cInternetFlag: number;
  cPhoneFlag: number;
  cMarginFlag: number;
  cIsFirstNickname: number;
  cAccountDefault: string;
  cUserName: string;
  cRankName: string;
  cAccType: string;
  cPointValue: number;
  cAvatarImg: string;
  cAvatarDefault: string;
  cBackGroundImg: string;
  cShortName: string;
  cPhoneOtp: string;
}

export type AccountProfile = Partial<AccountProfileValue>;

export type AccountProfileResponse = {
  rc: number;
  msg: string | undefined;
  data?: AccountProfile;
};

export interface ChangeNicknamePayload {
  ACTION_TYPE: string;
  PASS_WORD: string;
  NICK_NAME: string;
}

export interface ChangeNicknameForm {
  actionType: string;
  password: string | undefined;
  nickname: string;
}

export interface ChangeNicknameResponse {
  rc: number;
  msg: string | null;
  data?: {
    cAccountCode: string;
    cNickName: string;
    cChangeDate: string;
  };
}

export type CheckNicknameDataResponse = ChangeNicknameResponse["data"];

export interface ChangeAccountInfoForm {
  email: string;
  address: string;
  phoneNumber: string;
}

export interface ChangeAccountInfoResponse {
  rc: number;
  msg: string | null;
  data?: {
    C_ACCOUNT_CODE: string;
    C_CHANGE_DATE: string;
  };
}

export type ChangeAccountInfoDataResponse = ChangeAccountInfoResponse["data"];

export interface ChangeAccountInfoPayload {
  CUST_MOBILE: string;
  CUST_EMAIL: string;
  CONTACT_ADDRESS: string;
}

export type ChangeAccountInfoActionPayload = ChangeAccountInfoPayload & {
  otp: string;
};

export type ChangeAccountInfoType = "email" | "address" | "phoneNumber";

export type AccountSettingTypes = "infor" | "accBen";
