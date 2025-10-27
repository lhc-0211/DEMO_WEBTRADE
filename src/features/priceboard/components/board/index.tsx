import { memo, useEffect } from "react";
import { socketClient } from "../../../../services/socket";
import BodyTable from "./BodyTable";
import HeaderColumns from "./HeaderTable";

function Board() {
  const symbols = ["HPG:G1:STO"];
  // const snapshots = useWebSocket({ symbols });

  useEffect(() => {
    if (!symbols.length) return;

    // Subscribe (nếu không dùng useWebSocket)
    socketClient.subscribe({ symbols });

    return () => {
      socketClient.unsubscribe({ symbols });
    };
  }, []);

  return (
    <div>
      <HeaderColumns />
      {symbols.map((symbol) => (
        <BodyTable key={symbol} symbol={symbol} />
      ))}
    </div>
  );
}

export default memo(Board);
