import { memo, useEffect, useState } from "react";

const LOG_LIMIT = 20;

export const DebugPanel = memo(() => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Ghi đè console.log
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      const message = args
        .map((arg) =>
          typeof arg === "object" ? JSON.stringify(arg, null, 0) : String(arg)
        )
        .join(" ");
      setLogs((prev) => {
        const newLogs = [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ${message}`,
        ];
        return newLogs.slice(-LOG_LIMIT);
      });
      originalLog(...args);
    };
  }, []);

  if (logs.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 10,
        right: 10,
        width: 400,
        maxHeight: 300,
        background: "rgba(0,0,0,0.9)",
        color: "#0f0",
        fontFamily: "monospace",
        fontSize: 12,
        padding: 10,
        borderRadius: 8,
        overflowY: "auto",
        zIndex: 99999,
        border: "1px solid #0f0",
        boxShadow: "0 0 10px #0f0",
      }}
    >
      <div style={{ marginBottom: 5, fontWeight: "bold", color: "#fff" }}>
        DEBUG LOG (F5 để xóa)
      </div>
      {logs.map((log, i) => (
        <div key={i} style={{ wordBreak: "break-all" }}>
          {log}
        </div>
      ))}
    </div>
  );
});
