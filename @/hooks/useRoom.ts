import { useEffect, useState } from "react";

export const useRoom = (roomId: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    // WebSocket接続を確立
    const ws = new WebSocket(`/api/ws/${roomId}`);

    ws.onopen = () => {
      console.log("WebSocket接続が確立されました");
    };

    ws.onmessage = (event) => {
      console.log(event.data);
      // setMessages((prevMessages) => [...prevMessages, event.data]);
    };

    ws.onerror = (error) => {
      console.error("WebSocketエラー:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket接続が閉じられました");
    };
    setSocket(ws);
    // コンポーネントのアンマウント時にWebSocket接続を閉じる
    return () => {
      ws.close(1000);
    };
  }, [roomId]);

  return { socket };
};
