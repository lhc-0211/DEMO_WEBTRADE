import { memo, useEffect, useRef } from "react";
import { socketClient } from "../../../../services/socket";
import { useAppDispatch } from "../../../../store/hook";
import { setListStockByIdFromCache } from "../../../../store/slices/priceboard/slice";
import type { Favorite } from "../../../../types";
import PriceBoardBase from "./base";
import PriceBoardCW from "./cw";
import PriceBoardDeal from "./deal";
import PriceBoardFavorite from "./favorite";

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
      socketClient.unsubscribeAll();
      groupIdRef.current = "";
    }

    //TODO: Danh mục yêu thích
    if (id.startsWith("fav_")) {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      const fav = favorites.find((f: Favorite) => f.id === id);
      if (fav && Array.isArray(fav.symbols)) {
        // Gửi symbols từ danh mục yêu thích lên redux
        dispatch(setListStockByIdFromCache(id, fav.symbols));

        // Subscribe theo danh mục này
        socketClient.subscribe({
          symbols: [...fav.symbols], //đăng ký theo danh sách mã
        });

        groupIdRef.current = id;
        return;
      } else {
        console.warn(
          "Không tìm thấy danh mục yêu thích hoặc danh mục trống:",
          id
        );
        return;
      }
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
        socketClient.unsubscribeAll();
        groupIdRef.current = "";
      }
    };
  }, [id, dispatch]);

  return (
    <>
      {id === "hose" && <PriceBoardBase boardId={id} />}
      {id === "vn30" && <PriceBoardBase boardId={id} />}
      {id === "hnx30" && <PriceBoardBase boardId={id} />}
      {id === "hnx" && <PriceBoardBase boardId={id} />}
      {id === "upcom" && <PriceBoardBase boardId={id} />}
      {id === "hsx_ll" && <PriceBoardBase boardId={id} />}
      {id === "hnx_ll" && <PriceBoardBase boardId={id} />}
      {id === "upcom_ll" && <PriceBoardBase boardId={id} />}
      {id === "cw" && <PriceBoardCW boardId={id} />}

      {(id === "hsx_tt" || id === "hnx_tt" || id === "upcom_tt") && (
        <PriceBoardDeal boardId={id} />
      )}

      {id?.startsWith("fav_") && <PriceBoardFavorite boardId={id} />}
    </>
  );
}

export default memo(Board);
