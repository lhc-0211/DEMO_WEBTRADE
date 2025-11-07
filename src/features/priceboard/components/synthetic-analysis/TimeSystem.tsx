import { useEffect, useState } from "react";
import { isMarketOpen } from "../../../../utils";

export default function TimeSystem() {
  const [time, setTime] = useState<string>();
  const [day, setDay] = useState<string>();
  const [date, setDate] = useState<string>();
  const [isOpen, setIsOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      // Format time
      const time = now.toLocaleTimeString("vi-VN", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      // Format day + date
      const day = now.toLocaleDateString("vi-VN", { weekday: "long" });
      const date = now.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      setTime(time);
      setDay(day);
      setDate(`Ngày ${date}`);
      setIsOpen(isMarketOpen());
    };

    updateDateTime();

    const intervalId = setInterval(updateDateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="w-full grid place-items-center h-[148px] bg-surface rounded">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 items-center justify-center">
          {time ? (
            <h1 className="text-DTND-200 text-2xl font-bold">{time}</h1>
          ) : (
            <div className="animate-pulse h-8 w-30">
              <div className="w-full h-full bg-gray-300/40 rounded"></div>
            </div>
          )}
          <div className="flex flex-col gap-1 items-center justify-center">
            {day ? (
              <span className="text-sm font-medium text-text-body">{day}</span>
            ) : (
              <div className="animate-pulse h-5 w-[50px]">
                <div className="w-full h-full bg-gray-300/40 rounded"></div>
              </div>
            )}
            {date ? (
              <span className="text-xs font-medium text-text-body">{date}</span>
            ) : (
              <div className="animate-pulse h-4 w-[130px]">
                <div className="w-full h-full bg-gray-300/40 rounded"></div>
              </div>
            )}
          </div>
        </div>
        {isOpen === null ? (
          <div className="animate-pulse h-[26px] w-[130px]">
            <div className="w-full h-full bg-gray-300/40 rounded"></div>
          </div>
        ) : isOpen ? (
          <span className="px-4 rounded-lg text-background-primary bg-green-300 text-xs font-semibold h-[26px] grid place-items-center">
            Mở cửa
          </span>
        ) : (
          <span className="px-4 rounded-lg text-background-primary bg-red-300 text-xs font-semibold h-[26px] grid place-items-center">
            Đóng cửa
          </span>
        )}
      </div>
    </div>
  );
}
