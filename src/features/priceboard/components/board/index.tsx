import { memo, useEffect, useRef } from "react";
import { useWindowActive } from "../../../../hooks/useWindowActive";
import { socketClient, subscribedGroups } from "../../../../services/socket";
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

  const { windowIsActive, shouldRefreshAfterInactive, clearInactiveState } =
    useWindowActive();

  const groupIdRef = useRef<string>("");

  useEffect(() => {
    const handleVisibility = () => {
      socketClient.setTabActive(!document.hidden);
    };

    window.addEventListener("visibilitychange", handleVisibility);

    // Cleanup khi unmount
    return () => {
      window.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    if (!windowIsActive) return;
    socketClient.clearQueue();
    const needRefresh = shouldRefreshAfterInactive(60_000);

    if (needRefresh) {
      socketClient.clearFlash();
      socketClient.unsubscribeAll();

      if (groupIdRef.current?.startsWith("fav_")) {
        const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
        const fav = favorites.find((f: Favorite) => f.id === id);
        if (fav && Array.isArray(fav.symbols)) {
          // Gửi symbols từ danh mục yêu thích lên redux
          dispatch(setListStockByIdFromCache(id, fav.symbols));

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
      } else if (
        ["hsx_tt", "hnx_tt", "upcom_tt"].includes(groupIdRef.current)
      ) {
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
        socketClient.subscribe({ groupId: groupIdRef.current });
      }

      clearInactiveState();
    }
  }, [
    id,
    windowIsActive,
    shouldRefreshAfterInactive,
    clearInactiveState,
    dispatch,
  ]);

  useEffect(() => {
    if (!id) return;

    // Unsubscribe nhóm trước đó nếu có
    if (groupIdRef.current) {
      socketClient.unsubscribeAll();
      socketClient.clearQueue();
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

      subscribedGroups.add(id);
      socketClient.getSymbolList({ groupId: id });
      groupIdRef.current = id;
    }

    // Cleanup khi unmount hoặc id thay đổi
    return () => {
      if (groupIdRef.current) {
        socketClient.unsubscribeAll();
        socketClient.clearQueue();
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
        <PriceBoardDeal />
      )}

      {id?.startsWith("fav_") && <PriceBoardFavorite boardId={id} />}

      {/* <DebugPanel /> */}
    </>
  );
}

export default memo(Board);
