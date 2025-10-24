import { useEffect } from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useAppDispatch, useAppSelector } from "../../../../store/hook";
import {
  selectAllChartStatuses,
  selectChartIndexs,
  selectInfoIndex,
  selectInfoIndexStatus,
} from "../../../../store/slices/priceboard/selector";
import {
  fetchChartIndexRequest,
  fetchInfoIndexRequest,
} from "../../../../store/slices/priceboard/slice";
import type {
  ChartIndexItem,
  InfoIndex,
  MakeOptional,
  PriceVolumeChart,
} from "../../../../types";
import { convertTimeStringToUnix } from "../../../../utils";
import ChartIndexDashboardSkeleton from "./ChartIndexDashboardSkeleton";
import ChartIndexInfo from "./ChartIndexInfo";
import ChartRender from "./ChartRender";

export default function ChartIndexDashboard() {
  const dispatch = useAppDispatch();

  const infoIndex = useAppSelector(selectInfoIndex);
  const chartIndexs = useAppSelector(selectChartIndexs);

  const { loading } = useAppSelector(selectInfoIndexStatus);
  const chartStatuses = useAppSelector(selectAllChartStatuses);

  useEffect(() => {
    dispatch(fetchInfoIndexRequest());
  }, [dispatch]);

  useEffect(() => {
    if (infoIndex.length > 0) {
      infoIndex.forEach((dataIndex: InfoIndex) => {
        if (dataIndex.indexsTypeCode) {
          dispatch(fetchChartIndexRequest(dataIndex.indexsTypeCode));
        }
      });
    }
  }, [infoIndex, dispatch]);

  const swiperProps = {
    spaceBetween: 8,
    modules: [Navigation],
    pagination: { clickable: true },
    loop: true,
    breakpoints: {
      0: { slidesPerView: 3 },
    },
    className: "w-full h-full",
    noSwiping: true,
    noSwipingClass: "no-swiping",
  };

  const handleProcessDataChart = (dataChart: ChartIndexItem[]) => {
    const dataFormat: MakeOptional<PriceVolumeChart, "s"> = {
      c: [],
      h: [],
      l: [],
      o: [],
      v: [],
      t: [],
    };

    dataChart.forEach((item: ChartIndexItem) => {
      dataFormat.c.push(item.close);
      dataFormat.h.push(item.high);
      dataFormat.l.push(item.low);
      dataFormat.o.push(item.open);
      dataFormat.v.push(item.volume);
      dataFormat.t.push(convertTimeStringToUnix(item.time));
    });

    return dataFormat;
  };

  return (
    <div className="w-full h-full">
      <Swiper {...swiperProps} className="w-full h-full ">
        {loading
          ? [...Array(infoIndex.length || 4)].map((_, index) => (
              <SwiperSlide key={index} className="h-full">
                <ChartIndexDashboardSkeleton />
              </SwiperSlide>
            ))
          : infoIndex.map((item: InfoIndex) => {
              const status = chartStatuses[item.indexsTypeCode] || {
                loading: false,
                error: null,
              };
              const loadingChart = status.loading;

              return (
                <SwiperSlide key={item.indexsTypeCode} className="h-full">
                  <div className="flex flex-row gap-3 items-center w-full h-full bg-sidebar-default rounded border border-border">
                    <ChartIndexInfo dataIndex={item} />

                    {/* chart */}
                    {loadingChart ? (
                      <div className="w-3/5 animate-pulse h-full">
                        <div className="w-full h-full bg-gray-300/40 rounded"></div>
                      </div>
                    ) : (
                      <div className="w-3/5 h-full flex items-center justify-center rounded">
                        <ChartRender
                          data={handleProcessDataChart(
                            chartIndexs[item.indexsTypeCode]?.data?.length > 0
                              ? chartIndexs[item.indexsTypeCode].data
                              : []
                          )}
                          openIndex={item.openIndexes}
                        />
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              );
            })}
      </Swiper>
    </div>
  );
}
