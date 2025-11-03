import type { IErrMsg } from "../types";

function pick<T>(...values: (T | undefined | null)[]): T | undefined {
  for (const v of values) {
    if (v !== undefined && v !== null) {
      return v;
    }
  }
  return undefined;
}

export function numberFormat(
  input: string | number | undefined | null,
  decimals: number = 0,
  fallback: string = "",
  decimalSeparator?: string,
  thousandSeparator?: string
): string {
  // Xử lý các giá trị đặc biệt
  if (input === "ATO" || input === "ATC") return input;

  const h = Number(input) || 0;
  const c = Math.max(0, decimals);

  // Lấy số chữ số thập phân thực tế
  const fractionalLength = (h.toString().split(".")[1] || "").split("e")[0]
    .length;
  const parts = h.toString().split("e");

  // Làm tròn và định dạng số
  const g = (
    Math.abs(parts[1] ? Number(parts[0]) : h) +
    Math.pow(10, -Math.max(c, fractionalLength) - 1)
  ).toFixed(c);

  const w = String(parseInt(g, 10));
  const n = w.length > 3 ? w.length % 3 : 0;

  const dec = pick(decimalSeparator, ".")!;
  const thou = pick(thousandSeparator, ",")!;

  let formatted = (h < 0 ? "-" : "") + (n ? w.substring(0, n) + thou : "");
  formatted += w.substring(n).replace(/(\d{3})(?=\d)/g, `$1${thou}`);
  if (c) formatted += dec + g.slice(-c);
  if (parts[1] && +formatted !== 0) formatted += "e" + parts[1];

  if (Number(formatted) === 0) return fallback;
  return formatted;
}

export function mapIdToNameIndex(id: string) {
  const map: { [key: string]: string } = {
    "001": "VN-Index",
    "101": "VN30-Index",
    "002": "HNX-Index",
    "301": "UPCOM-Index",
  };

  return map[id] || id;
}

function FormatCurrency(
  num: number | string,
  delimitor: string,
  separate: string
): string {
  const sign = Number(num) === Math.abs(Number(num));
  let tail: string;
  let ret_value: string;

  // chuyển num sang chuỗi và loại bỏ dấu $ và ,
  num = num.toString().replace(/\$|,/g, "");

  if (isNaN(Number(num))) num = "0";

  const str = num.toString();
  const arr_str = str.split(separate);

  if (arr_str.length > 1) {
    tail = String(arr_str[1]);
    if (tail.length < 2) {
      tail = tail + "0";
    }
  } else {
    tail = "";
  }

  num = arr_str[0];

  for (let i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
    num =
      num.substring(0, num.length - (4 * i + 3)) +
      delimitor +
      num.substring(num.length - (4 * i + 3));
  }

  if (tail === "") ret_value = (sign ? "" : "-") + num;
  else ret_value = (sign ? "" : "-") + num + separate + tail;

  return ret_value;
}

export function StringToInt(pString: string | number): number {
  pString = "" + pString;
  pString = pString.replace(/,/g, "");
  const vInt = parseInt(pString, 10);
  if (isNaN(vInt)) {
    return 0;
  } else {
    return vInt;
  }
}

export function formatVolume10(number: string | number) {
  const vTemp = StringToInt(number) * 10;
  const vNumber = FormatCurrency(vTemp.toString(), ",", ".");
  return vNumber.substring(0, vNumber.length - 1);
}

export function formatVolPrice(vol: number) {
  return vol > 1e6 ? numberFormat(vol / 1e6) + " M" : numberFormat(vol);
}

export function StringToDouble(pString: string | number): number {
  pString = "" + pString;
  pString = pString.replace(/,/g, "");
  //Convert sang so he so 10
  const vFloat = parseFloat(pString);
  if (isNaN(vFloat)) {
    return 0;
  } else {
    return vFloat;
  }
}

export const formatAccount = (inputStr: string) => {
  if (!inputStr) return;
  const lastDigit = inputStr.slice(-1);
  const firstDigit = inputStr.slice(0, -1);

  return `TK-${firstDigit}.${lastDigit}`;
};

export const formatAccountType = (inputStr: string) => {
  if (!inputStr) return null;
  const lastDigit = inputStr.slice(-1);

  let label = "";
  let color = "";

  switch (lastDigit) {
    case "1":
      label = "Thường";
      color = "bg-DTND-400 text-black-white-100";
      break;
    case "6":
    case "7":
      label = "Margin";
      color = "bg-type-margin text-orange-700";
      break;
    case "8":
      label = "Nâng cao";
      color = "bg-blue-200 text-blue-700";
      break;
    case "9":
      label = "Phái sinh";
      color = "bg-type-ps text-green-700";
      break;
  }

  return { type: lastDigit, label, color };
};

export const hideMiddleDigits = (number: string) => {
  const visibleDigits = 2; // Số chữ số ở đầu và cuối muốn hiển thị
  const hiddenDigitsCount = number.length - visibleDigits * 2;
  const hiddenDigits = "*".repeat(hiddenDigitsCount);
  return `${number.slice(0, visibleDigits)}${hiddenDigits}${number.slice(
    -visibleDigits
  )}`;
};

export const formatTime = (seconds: number): string => {
  if (seconds === 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  const mm = m < 10 ? `0${m}` : `${m}`;
  const ss = s < 10 ? `0${s}` : `${s}`;

  return `${mm}:${ss}`;
};

export function checkInvalidSession(rs: string | undefined | null) {
  if (
    rs &&
    (rs === "INVALID_ACCESSTOKEN" ||
      rs.includes("InvalidSessionException") ||
      rs.includes("NotLoginException"))
  )
    return true;

  return false;
}

export const errMsg: IErrMsg = {
  "-6004": { msg: "Lệnh đã được xử lý, không được gửi lại." },
  "-6007": { msg: "Hủy lệnh không thành công." },
  "-6012": { msg: "Tài khoản không đủ sức mua." },
  "-6013": { msg: "Không đủ số dư chứng khoán." },
  "-6014": { msg: "Lệnh không được hủy." },
  "-6015": { msg: "Không được sửa lệnh này." },
  "-6016": { msg: "Loại chứng khoán không hợp lệ." },
  "-6017": { msg: "Tài Khoản đang chờ kích hoạt." },
  "-6019": { msg: "Khối lượng đặt không hợp lệ." },
  "-6020": { msg: "Không xác định được thị trường." },
  "-6021": { msg: "Giá không phù hợp." },
  "-6022": { msg: "Hết giờ giao dịch." },
  "-6023": { msg: "Loại lệnh không phù hợp." },
  "-6024": { msg: "Không được đặt loại lệnh phiên này." },
  "-6025": { msg: "Hệ thống chưa sẵn sàng đặt lệnh ngoài giờ." },
  "-6026": { msg: "Không được huỷ/sửa lệnh phiên này." },
  "-6027": { msg: "Không được đặt lệnh điều kiện." },
  "-6028": { msg: "Tài khoản không được mua - bán." },
  "-6029": { msg: "Tài khoản không được ủy quyền." },
  "-6030": { msg: "User không có quyền xem tài khoản." },
  "-6031": { msg: "Chứng khoán không hợp lệ." },
  "-6032": { msg: "Vượt qua tỷ lệ an toàn tài khoản." },
  "-6033": { msg: "Chứng khoán đáo hạn không được giao dịch." },
  "-6034": { msg: "Vượt qua khối lượng 1000 của phái sinh." },
  "-6035": { msg: "Sai giá trần/sàn." },
  "-6036": { msg: "Sai bước giá cho trái phiếu." },
  "-6037": { msg: "Không được đặt lệnh." },
  "-6038": { msg: "Vượt qua tổng vị thế tối đa." },
  "-6039": { msg: "Tài khoản mới mở, chưa được giao dịch." },
  "-6041": { msg: "Tài khoản hạn chế giao dịch." },
  "-6043": { msg: "Không được mua bán cùng phiên." },
  "-6045": { msg: "Chứng khoán hết room cho vay" },
  "-6046": { msg: "Chứng khoán hết room nước ngoài" },
  "-6047": { msg: "Hết hạn mức mã chứng khoán " },
  "-6048": { msg: "Không được sửa đồng thời giá và khối lượng" },
  "-6666": { msg: "Hết hạn mức nguồn." },
  "-6667": { msg: "Hết hạn mức tài khoản." },
  "-6668": { msg: "Tài khoản hạn chế bán do QTRR." },
  "-6669": { msg: "Lệnh forcesell, KH không được thao tác." },
  "-6670": { msg: "Hết hạn mức tổng của nhóm." },
  "-6671": { msg: "Hết hạn mức công ty." },

  "-8001": { msg: "Không kết nối được với gateway." },
  "-8002": { msg: "Không được hủy/sửa lệnh phiên này" },
  "-8003": { msg: "Không hủy/sửa phiên khớp lệnh định kỳ." },
  "-8004": { msg: "Lệnh đã khớp hết, không được hủy/sửa." },
  "-8005": { msg: "Sai mã PIN." },
  "-8006": { msg: "Không dùng password cũ." },
  "-8007": { msg: "Password không hợp lệ." },
  "-8008": { msg: "Không có quyền truy cập từ IP ngoài." },
  "-8009": { msg: "TRADER HALT." },
  "-8010": { msg: "Hệ thống đang thi với HSX, KHÔNG ĐƯỢC ĐẶT LỆNH." },
  "-8011": { msg: "BrokerID đang bị chặn MUA." },
  "-8012": { msg: "BrokerID đang bị chặn BÁN." },
  "-8013": { msg: "BrokerID đang bị chặn giao dịch." },
  "-8014": { msg: "BrokerID bị chặn giao dịch thoả thuận." },
  "-8015": { msg: "BrokerID bị chặn giao dịch thoả thuận BÁN." },
  "-8016": { msg: "BrokerID bị chặn giao dịch thoả thuận MUA." },
  "-9998": { msg: "Lệnh chưa được confirm!" },
  "-9999": { msg: "Không đủ điều kiện sửa." },
  "-9001": { msg: "Không được giao dịch mã chứng quyền trên TK margin" },
  "-9501": {
    msg: "Giá trị giao dịch vượt quá giá trị giao dịch cho phép trong ngày/tháng",
  },
  "-9502": {
    msg: "Giá trị giao dịch vượt quá giá trị giao dịch cho phép trong ngày/tháng",
  },
  "-8": { msg: "Hệ thống chưa sẵn sàng nhận lệnh" },
  "-111": { msg: "Không kết nối được hệ thống." },
};

export function getMsgByErrorCode(code: string) {
  if (code == "-8005") {
    localStorage.removeState("isAuthOtp");
  }
  return errMsg[code] ? errMsg[code]?.msg : "Error";
}

export function getRandom() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 23; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

export function getOrderStatus(
  sttCode: string,
  matchVol = 0,
  orderVol = 0,
  quote = "Y",
  index = "HOSE"
) {
  // log(sttCode, index)
  if (sttCode === "P") {
    return "Chờ khớp";
  } else if (sttCode.endsWith("W")) {
    return "Chờ hủy";
  } else if (sttCode.endsWith("M")) {
    if (StringToInt(matchVol) === StringToInt(orderVol)) return "Đã khớp";

    return "Khớp 1 phần";
  } else if (sttCode.endsWith("X")) {
    if (StringToInt(matchVol) > 0) return "Khớp 1 phần, 1 phần đã hủy";
    return "Đã hủy";
  } else if (sttCode.endsWith("C")) {
    if (index === "HNX" && quote === "G") return "Chờ sửa";
    if (index === "HNX" && quote === "Y") return "Chờ khớp";
    return "Đã sửa";
  } else if (sttCode.indexOf("R") > 0) {
    return "Từ chối";
  }

  return sttCode;
}

export function canDeleteOrder(
  ordrStatTp: string,
  ordrQty: string | number,
  matchedQty: string | number
) {
  if (ordrStatTp === "P" || ordrStatTp.endsWith("C")) return true;
  if (
    ordrStatTp.endsWith("M") &&
    StringToInt(matchedQty) < StringToInt(ordrQty)
  )
    return true;

  return false;
}

export function canEditOrder(
  ordrStatTp: string,
  ordrQty: string | number,
  matchedQty: string | number
) {
  if (ordrStatTp === "P" || ordrStatTp.endsWith("C")) return true;
  if (
    ordrStatTp.endsWith("M") &&
    StringToInt(matchedQty) < StringToInt(ordrQty)
  )
    return true;

  return false;
}

export const formatPrice = (value?: number | string | null): string => {
  if (value == null || value === "") return "";
  const num = Number(value) / 1000; // đổi từ đồng sang nghìn đồng
  return num.toFixed(2); // ví dụ: 29400 -> 29.40
};
