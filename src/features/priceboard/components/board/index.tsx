import { memo, useEffect, useRef } from "react";
import { socketClient } from "../../../../services/socket";
import { useAppDispatch } from "../../../../store/hook";
import { setListStockByIdFromCache } from "../../../../store/slices/priceboard/slice";
import PriceBoardBase from "./base";
import PriceBoardCW from "./cw";
import PriceBoardDeal from "./deal";

interface BoardProps {
  id: string;
}

function Board({ id }: BoardProps) {
  const dispatch = useAppDispatch();

  const groupIdRef = useRef<string>("");
  useEffect(() => {
    if (!id) return;

    // Unsubscribe nhóm trước đó nếu có
    if (groupIdRef.current) {
      if (["hsx_tt", "hnx_tt", "upcom_tt"].includes(id)) {
        console.log("unsub tt");
      } else {
        socketClient.unsubscribe({ groupId: groupIdRef.current });
      }
      groupIdRef.current = "";
    }

    // Nếu id là các thị trường thỏa thuận
    if (["hsx_tt", "hnx_tt", "upcom_tt"].includes(id)) {
      groupIdRef.current = id;
      let marketId = "";

      switch (id) {
        case "hsx_tt":
          marketId = "STO";
          break;
        case "hnx_tt":
          marketId = "STX";
          break;
        case "upcom_tt":
          marketId = "UPCOM";
          break;
      }

      socketClient.requestNego(marketId);
    } else {
      const cacheKey = `stocks_${id}`;
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          const symbols = parsed.symbols;

          if (Array.isArray(symbols) && symbols.length > 0) {
            dispatch(setListStockByIdFromCache(id, symbols));
            socketClient.subscribe({ groupId: id });
            groupIdRef.current = id;
            return;
          }
        } catch (e) {
          console.warn("Cache invalid or corrupted:", e);
          localStorage.removeItem(cacheKey);
        }
      }

      socketClient.getSymbolList({ groupId: id });
      socketClient.subscribe({ groupId: id });
      groupIdRef.current = id;
    }

    // Cleanup khi unmount hoặc id thay đổi
    return () => {
      if (groupIdRef.current) {
        if (["hsx_tt", "hnx_tt", "upcom_tt"].includes(id)) {
          console.log("unsub tt");
        } else {
          socketClient.unsubscribe({ groupId: groupIdRef.current });
        }
        groupIdRef.current = "";
      }
    };
  }, [id, dispatch]);

  return (
    <>
      {(id === "hose" ||
        id === "vn30" ||
        id === "hnx" ||
        id === "hnx30" ||
        id === "upcom" ||
        id === "hsx_ll" ||
        id === "hnx_ll" ||
        id === "upcom_ll") && <PriceBoardBase boardId={id} />}

      {id === "cw" && <PriceBoardCW boardId={id} />}

      {(id === "hsx_tt" || id === "hnx_tt" || id === "upcom_tt") && (
        <PriceBoardDeal boardId={id} />
      )}
    </>
  );
}

export default memo(Board);
