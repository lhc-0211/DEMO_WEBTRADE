import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useAppSelector } from "../../../../store/hook";
import { selectMajorIndices } from "../../../../store/slices/stock/selector";
import ChartIndexDashboardSkeleton from "./ChartIndexDashboardSkeleton";
import ChartIndexInfo from "./ChartIndexInfo";

export default function ChartIndexDashboard() {
  const { vnIndex, vn30Index, hnxIndex, upcomIndex } =
    useAppSelector(selectMajorIndices);

  const indicesList = [
    { key: "1:200", label: "VN-Index", data: vnIndex },
    { key: "1:002", label: "VN30", data: vn30Index },
    { key: "2:200", label: "HNX", data: hnxIndex },
    { key: "4:200", label: "UPCoM", data: upcomIndex },
  ].filter((item) => !!item.data);

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

  // const handleProcessDataChart = (dataChart: ChartIndexItem[]) => {
  //   const dataFormat: MakeOptional<PriceVolumeChart, "s"> = {
  //     c: [],
  //     h: [],
  //     l: [],
  //     o: [],
  //     v: [],
  //     t: [],
  //   };

  //   dataChart.forEach((item: ChartIndexItem) => {
  //     dataFormat.c.push(item.close);
  //     dataFormat.h.push(item.high);
  //     dataFormat.l.push(item.low);
  //     dataFormat.o.push(item.open);
  //     dataFormat.v.push(item.volume);
  //     dataFormat.t.push(convertTimeStringToUnix(item.time));
  //   });

  //   return dataFormat;
  // };

  return (
    <div className="w-full h-full">
      <Swiper {...swiperProps} className="w-full h-full ">
        {indicesList.length === 0
          ? [...Array(4)].map((_, index) => (
              <SwiperSlide key={index} className="h-full">
                <ChartIndexDashboardSkeleton />
              </SwiperSlide>
            ))
          : indicesList.map(({ key, data }) => {
              return (
                <SwiperSlide key={key} className="h-full">
                  <div className="flex flex-row gap-3 items-center w-full h-full bg-sidebar-default rounded border border-border">
                    <ChartIndexInfo dataIndex={data} />
                    {/* //   {loadingChart ? ( */}
                    <div className="w-3/5 animate-pulse h-full">
                      <div className="w-full h-full bg-gray-300/40 rounded"></div>
                    </div>
                    {/* // ) : (
                    //   <div className="w-3/5 h-full flex items-center justify-center rounded">
                    //     <ChartRender
                    //       data={handleProcessDataChart(
                    //         chartIndexs[item.indexsTypeCode]?.data?.length > 0
                    //           ? chartIndexs[item.indexsTypeCode].data
                    //           : []
                    //       )}
                    //       openIndex={item.openIndexes}
                    //     />
                    //   </div>
                    // )} */}
                  </div>
                </SwiperSlide>
              );
            })}
      </Swiper>
    </div>
  );
}
