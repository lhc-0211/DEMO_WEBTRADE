import dayjs from "dayjs";
import moment from "moment-timezone";

export function convertTimeStringToUnix(timeString: string): number {
  // Lấy ngày hiện tại theo giờ Việt Nam (UTC+7)
  const today = moment().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD");

  // Kết hợp ngày hiện tại với giờ từ đầu vào
  const localTime = moment.tz(
    `${today} ${timeString}`,
    "YYYY-MM-DD HH:mm:ss",
    "Asia/Ho_Chi_Minh"
  );

  // Trả về Unix timestamp (giây)
  return localTime.unix();
}

export function addZero(i: string) {
  if (Number(i) < 10) {
    i = "0" + i;
  }
  return i;
}

export function stringFull2Date(data: string) {
  const _d = dayjs(
    data,
    [
      "M-DD-YYYY HH:mm:ss",
      "M-D-YYYY HH:mm:ss",
      "MM-DD-YYYY HH:mm:ss",
      "DD-MM-YYYY HH:mm:ss",
      "D-M-YYYY HH:mm:ss",
      "D-M-YYYY",
      "DD-MM-YYYY",
      "M-D-YYYY",
      "MM-DD-YYYY",
    ],
    true
  );
  return _d.toDate();
}

export function replaceAll(
  str: string | undefined,
  find: string,
  replace: string = ""
): string {
  if (!str) return "";

  return str.replace(new RegExp(find, "g"), replace);
}

export function diff2Date(date1: string | Date, date2: string | Date) {
  if (!date1 || !date2) return -1;
  let mydate1: Date, mydate2: Date;
  if (typeof date1 === "string") {
    const parts1 = replaceAll(date1, "-", "/").split("/");
    mydate1 = new Date(
      Number(parts1[2]),
      Number(parts1[1]) - 1,
      Number(parts1[0])
    );
  } else {
    mydate1 = date1;
  }
  if (typeof date2 === "string") {
    const parts2 = replaceAll(date2, "-", "/").split("/");
    mydate2 = new Date(
      Number(parts2[2]),
      Number(parts2[1]) - 1,
      Number(parts2[0])
    );
  } else {
    mydate2 = date2;
  }

  const diff = Math.floor(
    (mydate1.getTime() - mydate2.getTime()) / (1000 * 60 * 60 * 24)
  );

  return diff || 0;
}
export function formatDate(
  idata: number | string | Date | null,
  slack: string = ":",
  _fm: "ymd" | "dmy" = "ymd"
): string | null {
  if (!idata) return null;

  let dateObj: Date;

  try {
    if (idata instanceof Date) {
      dateObj = idata;
    } else if (typeof idata === "number") {
      dateObj = new Date(idata);
    } else if (typeof idata === "string") {
      // Chuẩn hóa chuỗi: dd/mm/yyyy hoặc yyyy-mm-dd
      const normalized = idata.includes("/")
        ? idata.split("/").reverse().join("-") // dd/mm/yyyy -> yyyy-mm-dd
        : idata;
      dateObj = new Date(normalized);
    } else {
      return null;
    }

    if (isNaN(dateObj.getTime())) return null;

    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");

    return _fm === "ymd"
      ? `${y}${slack}${m}${slack}${d}`
      : `${d}${slack}${m}${slack}${y}`;
  } catch {
    return null;
  }
}

export function _diff2Date(
  date1: string | Date | null,
  date2: string | Date | null
): number {
  if (!date1 || !date2) return 0; // nếu null thì trả về 0

  let mydate1: Date;
  let mydate2: Date;

  // Xử lý date1
  if (typeof date1 === "string") {
    const parts1 = date1.split("/");
    if (parts1.length === 3) {
      mydate1 = new Date(
        Number(parts1[2]),
        Number(parts1[1]) - 1,
        Number(parts1[0])
      );
    } else {
      throw new Error(`Sai định dạng ngày: ${date1}`);
    }
  } else {
    mydate1 = date1;
  }

  // Xử lý date2
  if (typeof date2 === "string") {
    const parts2 = date2.split("/");
    if (parts2.length === 3) {
      mydate2 = new Date(
        Number(parts2[2]),
        Number(parts2[1]) - 1,
        Number(parts2[0])
      );
    } else {
      throw new Error(`Sai định dạng ngày: ${date2}`);
    }
  } else {
    mydate2 = date2;
  }

  // Tính chênh lệch (đơn vị: ngày)
  const diffTime = mydate1.getTime() - mydate2.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays || 0;
}
