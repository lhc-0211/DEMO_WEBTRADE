import { memo, useEffect, useRef } from "react";
import { socketClient } from "../../../../services/socket";
import { useAppDispatch } from "../../../../store/hook";
import { setListStockByIdFromCache } from "../../../../store/slices/priceboard/slice";
import { fetchListStockById } from "../../../../store/slices/priceboard/thunks";
import PriceBoardBase from "./base";

interface BoardProps {
  id: string;
}

function Board({ id }: BoardProps) {
  const dispatch = useAppDispatch();

  const groupIdRef = useRef<string>("");

  useEffect(() => {
    if (!id) return;

    const cacheKey = `stocks_${id}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (groupIdRef.current) {
      socketClient.unsubscribe({ groupId: groupIdRef.current });
      groupIdRef.current = "";
    }

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

    dispatch(fetchListStockById(id)).then((action) => {
      if (fetchListStockById.fulfilled.match(action)) {
        const response = action.payload;
        const symbols = response.symbols;

        // Lưu cache
        localStorage.setItem(cacheKey, JSON.stringify(response));

        // Cập nhật Redux
        dispatch(setListStockByIdFromCache(id, symbols));

        // Subscribe
        socketClient.subscribe({ groupId: id });

        groupIdRef.current = id;
      }
    });

    return () => {
      if (groupIdRef.current) {
        socketClient.unsubscribe({ groupId: id });
        groupIdRef.current = "";
      }
    };
  }, [id, dispatch]);

  return <PriceBoardBase boardId={id} />;
}

export default memo(Board);
