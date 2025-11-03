import { memo, useEffect, useRef } from "react";
import { socketClient } from "../../../../services/socket";
import { useAppDispatch } from "../../../../store/hook";
import { setListStockByIdFromCache } from "../../../../store/slices/priceboard/slice";
import { fetchListStockById } from "../../../../store/slices/priceboard/thunks";
import { setSubscribedOrder } from "../../../../store/slices/stock/slice";
import PriceBoardBase from "./base";

interface BoardProps {
  id: string;
}

function Board({ id }: BoardProps) {
  const dispatch = useAppDispatch();

  const symbolsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!id) return;

    const cacheKey = `stocks_${id}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (symbolsRef.current.length > 0) {
      socketClient.unsubscribe({ symbols: symbolsRef.current });
      symbolsRef.current = [];
    }

    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        const symbols = parsed.symbols;

        if (Array.isArray(symbols) && symbols.length > 0) {
          dispatch(setListStockByIdFromCache(id, symbols));
          dispatch(setSubscribedOrder(symbols));
          socketClient.subscribe({ symbols });

          symbolsRef.current = symbols;
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
        dispatch(setSubscribedOrder(symbols));

        // Subscribe
        socketClient.subscribe({ symbols });

        symbolsRef.current = symbols;
      }
    });

    return () => {
      if (symbolsRef.current.length > 0) {
        socketClient.unsubscribe({ symbols: symbolsRef.current });
        symbolsRef.current = [];
      }
    };
  }, [id, dispatch]);

  return <PriceBoardBase boardId={id} />;
}

export default memo(Board);
