import { HOLIDAYS } from "../configs";
import { StringToDouble } from "./format";

export function setAppHeight() {
  const vh = window.innerHeight;
  document.documentElement.style.setProperty("--app-height", `${vh}px`);
}

export function colorFix(
  cPrice: number | string,
  oPrice: number,
  tran: number,
  san: number,
  tc: number
): string {
  if (typeof cPrice === "string") {
    cPrice = StringToDouble(cPrice);
  }
  if (cPrice == 0) return "preo";
  if (cPrice == tc) return "r";
  if (cPrice == tran) return "c";
  if (cPrice == san) return "f";
  if (cPrice - oPrice > 0) {
    return "i";
  } else if (cPrice - oPrice < 0) {
    return "d";
  }
  return "r";
}

export function getStatusIndex(st: string | number, mc = "10") {
  const hours = new Date().getHours();
  if (mc === "10" || mc === "11") {
    // hose
    if (
      (st === "undefined" || st === "Undefined" || st == undefined) &&
      hours >= 9 &&
      hours < 10
    )
      return "ATO";

    if (st === "P") {
      return "ATO";
    }
    if (st === "O") {
      return "Mở cửa";
    }
    if (st === "I") {
      return "Nghỉ trưa";
    }
    if (st === "A") {
      return "ATC";
    }
    if (st === "C") {
      return "Thỏa thuận";
    }
    return "Đóng cửa";
  }

  if (mc === "02") {
    // hnx
    if (st === "O") {
      return "Mở cửa";
    }
    if (st === "I") {
      return "Nghỉ trưa";
    }
    if (st === "A") {
      return "ATC";
    }
    if ((st === "C" || st === "K") && hours < 15 && hours > 12) {
      return "PLO";
    }
    return "Đóng cửa";
  }
  if (mc === "03") {
    if (st === "O") {
      return "Mở cửa";
    }
    if (st === "I") {
      return "Nghỉ trưa";
    }
    return "Đóng cửa";
  }
}

function isHoliday(date: Date): boolean {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const key = `${month}-${day}`;
  return HOLIDAYS.includes(key);
}

function isWeekday(date: Date): boolean {
  const day = date.getDay(); // 0 = Chủ nhật, 6 = Thứ 7
  return day >= 1 && day <= 5;
}

function isWithinTradingHours(date: Date): boolean {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const totalMinutes = hour * 60 + minute;

  const openMorning = 9 * 60; // 09:00
  const closeMorning = 11 * 60 + 30; // 11:30
  const openAfternoon = 13 * 60; // 13:00
  const closeAfternoon = 15 * 60; // 15:00

  return (
    (totalMinutes >= openMorning && totalMinutes < closeMorning) ||
    (totalMinutes >= openAfternoon && totalMinutes < closeAfternoon)
  );
}

export function isMarketOpen(): boolean {
  const now = new Date();

  if (!isWeekday(now)) return false;
  if (isHoliday(now)) return false;

  return isWithinTradingHours(now);
}

export const isEmptyObject = (obj?: object | string | null): boolean =>
  !obj || Object.keys(obj).length === 0;

export function getColorTypeAcc(type: string) {
  const cleanType = type?.normalize("NFC").trim();

  switch (cleanType) {
    case "N":
      return "bg-DTND-500";
    case "M":
      return "bg-type-margin";
    default:
      return "bg-DTND-500";
  }
}

export function getBgColorStock(type: string) {
  const cleanType = type?.normalize("NFC").trim();

  switch (cleanType) {
    case "i":
      return "bg-success-darker";
    case "d":
      return "bg-error-darker";
    case "r":
      return "bg-warning-darker";
    case "f":
      return "bg-infomation-darker";
    case "c":
      return "bg-features-darker";
    default:
      return "bg-success-darker";
  }
}

const bankLogos = import.meta.glob(
  "../assets/imgs/banks/*.{png,jpg,jpeg,svg}",
  { eager: true }
) as Record<string, { default: string }>;

export function getBankLogo(name: string) {
  const entry = Object.entries(bankLogos).find(([path]) => path.includes(name));
  return entry ? entry[1].default : "";
}
