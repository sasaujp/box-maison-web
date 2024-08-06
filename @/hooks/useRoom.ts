import { useEffect, useState, useCallback } from "react";

// コマンドの型定義（サーバー側と共通）
type CommandType = "RequestId" | "UpdatePosition" | "Ping" | "Error";

interface BaseCommand {
  type: CommandType;
  timestamp: number;
}

interface RequestIdCommand extends BaseCommand {
  type: "RequestId";
}

interface UpdatePositionCommand extends BaseCommand {
  type: "UpdatePosition";
  userId: string;
  data: {
    x: number;
    y: number;
  };
}

interface PingCommand extends BaseCommand {
  type: "Ping";
}

interface ErrorCommand extends BaseCommand {
  type: "Error";
  error: string;
}

type Command =
  | RequestIdCommand
  | UpdatePositionCommand
  | PingCommand
  | ErrorCommand;

// サーバーレスポンスの型
interface ServerResponse<T = unknown> {
  type: CommandType;
  status: "success" | "error";
  data?: T;
  error?: string;
}

export const sendCommand = (socket: WebSocket, command: Command) => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(command));
  } else {
    console.error("WebSocket is not open. ReadyState:", socket.readyState);
  }
};

export const useRoom = (roomId: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(() => {
    const ws = new WebSocket(`/api/ws/${roomId}`);

    ws.onopen = () => {
      console.log("WebSocket接続が確立されました");
      setIsConnected(true);
      setError(null);
      sendCommand(ws, { type: "RequestId", timestamp: Date.now() });
    };

    ws.onmessage = (event) => {
      try {
        const response: ServerResponse = JSON.parse(event.data);
        console.log("Received:", response);

        switch (response.type) {
          case "RequestId":
            // RequestIdの処理
            console.log(response.data);
            break;
          case "UpdatePosition":
            // UpdatePositionの処理
            break;
          case "Ping":
            console.log(response);
            break;
          case "Error":
            setError(response.error || "Unknown error occurred");
            break;
          default:
            console.warn("Unknown response type:", response.type);
        }
      } catch (err) {
        console.error("Failed to parse server message:", err);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocketエラー:", error);
      setError("WebSocket connection error");
    };

    ws.onclose = (event) => {
      console.log("WebSocket接続が閉じられました", event.code, event.reason);
      setIsConnected(false);
      setError(event.reason || "WebSocket connection closed");
    };

    setSocket(ws);

    return ws;
  }, [roomId]);

  useEffect(() => {
    const ws = connect();

    return () => {
      ws.close(1000, "Component unmounted");
    };
  }, [connect]);

  const reconnect = useCallback(() => {
    if (socket) {
      socket.close();
    }
    connect();
  }, [socket, connect]);

  // ping
  useEffect(() => {
    if (!socket) {
      return;
    }

    const interval = setInterval(() => {
      if (socket.readyState !== WebSocket.OPEN) {
        reconnect();
        return;
      }
      sendCommand(socket, { type: "Ping", timestamp: Date.now() });
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [reconnect, socket]);

  return { socket, isConnected, error, reconnect };
};
