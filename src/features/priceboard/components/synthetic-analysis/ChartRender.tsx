import {
  BaselineSeries,
  createChart,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  LastPriceAnimationMode,
  LineStyle,
  type Time,
  type UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useRef } from "react";
import type { MakeOptional, PriceVolumeChart } from "../../../../types";
import { numberFormat } from "../../../../utils";

interface Props {
  data: MakeOptional<PriceVolumeChart, "s">;
  openIndex: number;
}

const ChartRender = (props: Props) => {
  const { data, openIndex } = props;
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const baselineSeriesRef = useRef<ISeriesApi<"Baseline"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) {
      return;
    }

    // Tạo div cho tooltip
    const tooltip = document.createElement("div");
    tooltip.style.position = "absolute";
    tooltip.style.background = "var(--color-background-primary)";
    tooltip.style.color = "var(--color-text-title)";
    tooltip.style.fontSize = "8px";
    tooltip.style.padding = "8px";
    tooltip.style.borderRadius = "4px";
    tooltip.style.display = "none";
    tooltip.style.zIndex = "1000";
    tooltip.style.pointerEvents = "none";
    chartContainerRef.current.appendChild(tooltip);
    tooltipRef.current = tooltip;

    // Tạo chart
    const chart: IChartApi = createChart(chartContainerRef.current, {
      handleScale: {
        mouseWheel: false,
        pinch: false,
        axisPressedMouseMove: true,
      },
      rightPriceScale: {
        visible: false,
      },
      layout: {
        background: {
          color: "#101011",
        },
        textColor: "#ffffffa3",
        fontFamily: "Plus Jakarta Sans",
        fontSize: 8,
        attributionLogo: false,
      },
      grid: {
        vertLines: {
          visible: false,
        },
        horzLines: {
          visible: false,
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        fixLeftEdge: true,
        fixRightEdge: true,
        tickMarkFormatter: (time: UTCTimestamp) => {
          const date = new Date(time * 1000);
          return date.toLocaleTimeString("vi-VN", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          });
        },
      },
      localization: {
        timeFormatter: (time: UTCTimestamp) => {
          const date = new Date(time * 1000);
          const dateStr = date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
          const timeStr = date.toLocaleTimeString("vi-VN", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          });
          return `${dateStr} ${timeStr}`;
        },
      },
    });

    // Lưu chart vào ref
    chartRef.current = chart;

    // Tạo series
    const baselineSeries = chart.addSeries(BaselineSeries, {
      baseValue: { type: "price", price: openIndex },
      topLineColor: "#34c85a",
      topFillColor1: "#34c85a1a",
      topFillColor2: "#34c85a1a",
      bottomLineColor: "#fd3b31",
      bottomFillColor1: "#ff00171a",
      bottomFillColor2: "#ff00171a",
      lineWidth: 1,
      lastPriceAnimation: LastPriceAnimationMode.Continuous,
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: "#0bdf39",
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "",
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.3,
        bottom: 0,
      },
    });

    // Lưu series vào refs
    baselineSeriesRef.current = baselineSeries;
    volumeSeriesRef.current = volumeSeries;

    // Tùy chỉnh tooltip
    chart.subscribeCrosshairMove((param) => {
      if (!tooltipRef.current || !param.time || !param.seriesData) {
        if (tooltipRef.current) tooltipRef.current.style.display = "none";
        return;
      }

      const priceData = param.seriesData.get(baselineSeries);
      const volumeData = param.seriesData.get(volumeSeries);
      const time = new Date((param.time as number) * 1000).toLocaleString(
        "vi-VN",
        {
          timeZone: "Asia/Ho_Chi_Minh",
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }
      );

      let tooltipContent = `${time}<br>`;
      if (priceData && typeof priceData === "object" && "value" in priceData) {
        tooltipContent += `${numberFormat(priceData?.value + "", 0, "0")}<br>`;
      }
      if (
        volumeData &&
        typeof volumeData === "object" &&
        "value" in volumeData
      ) {
        tooltipContent += `${numberFormat(volumeData?.value + "", 0, "0")}`;
      }

      tooltipRef.current.innerHTML = tooltipContent;
      tooltipRef.current.style.display = "block";

      const tooltipHeight = 3 * 16 + 8 * 2;
      const offsetX = 2;
      const offsetY = 2;
      let left =
        (param.point?.x || 0) - offsetX - tooltipRef.current.offsetWidth;
      let top = (param.point?.y || 0) - offsetY - tooltipHeight;

      if (left < 0) left = 0;
      if (top < 0) top = (param.point?.y || 0) + offsetY;

      tooltipRef.current.style.left = `${left}px`;
      tooltipRef.current.style.top = `${top}px`;
    });

    // Ẩn tooltip khi chuột ra khỏi biểu đồ
    chart.subscribeCrosshairMove((param) => {
      if (!param.point && tooltipRef.current) {
        tooltipRef.current.style.display = "none";
      }
    });

    // Xử lý resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.resize(
          chartContainerRef.current.clientWidth,
          chartContainerRef.current.clientHeight
        );
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (tooltipRef.current) {
        tooltipRef.current.remove();
      }
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (
      !chartRef.current ||
      !baselineSeriesRef.current ||
      !volumeSeriesRef.current ||
      data.c.length <= 0 ||
      data.t.length <= 0 ||
      data.v.length <= 0
    ) {
      return;
    }

    // Cập nhật baseValue cho baselineSeries
    baselineSeriesRef.current.applyOptions({
      baseValue: { type: "price", price: openIndex },
    });

    // Xóa price line cũ và tạo mới
    baselineSeriesRef.current.createPriceLine({
      price: openIndex,
      color: "#fdff12",
      lineWidth: 1,
      lineStyle: LineStyle.Solid,
      axisLabelVisible: true,
    });

    // Chuẩn bị dữ liệu
    const chartData: { time: UTCTimestamp; value: number }[] = [];
    const barData: { time: UTCTimestamp; value: number; color: string }[] = [];

    for (const i in data.t) {
      const timestamp = data.t[i];
      const price = data.c[i];
      chartData.push({ time: timestamp as UTCTimestamp, value: price });
      barData.push({
        time: timestamp as UTCTimestamp,
        value: data.v[i],
        color: data.c[i] >= data.o[i] ? "#34c85a40" : "#ff001740",
      });
    }

    // Sắp xếp dữ liệu theo thời gian
    chartData.sort((a, b) => a.time - b.time);
    barData.sort((a, b) => a.time - b.time);

    // Cập nhật dữ liệu cho series
    baselineSeriesRef.current.setData(chartData);
    volumeSeriesRef.current.setData(barData);

    // Đặt phạm vi thời gian động
    const minTime = Math.min(...data.t) as Time;
    const maxTime = Math.max(...data.t) as Time;
    chartRef.current.timeScale().setVisibleRange({
      from: minTime,
      to: maxTime,
    });
  }, [data, openIndex]);

  return (
    <div
      ref={chartContainerRef}
      className="chart-container w-full h-full no-swiping"
      style={{ position: "relative" }}
    />
  );
};

export default ChartRender;
