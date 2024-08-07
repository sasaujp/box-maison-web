import {
  activeUsersAtom,
  avaterPositionsAtom,
  isConnnectedAtom,
  socketAtom,
} from "@/atoms/atom";
import { sendCommand } from "@/websocket/command";
import { ServerResponse } from "@/websocket/response";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, useState, useCallback } from "react";

export const useRoom = (roomId: string) => {
  const [socket, setSocket] = useAtom(socketAtom);

  const setAvaterPositions = useSetAtom(avaterPositionsAtom);
  const setActiveUsers = useSetAtom(activeUsersAtom);

  const [isConnected, setIsConnected] = useAtom(isConnnectedAtom);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(() => {
    const ws = new WebSocket(`/api/ws/${roomId}`);

    ws.onopen = () => {
      console.log("WebSocket接続が確立されました");
      sendCommand(ws, { type: "Ping", initial: true });
      setIsConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const response: ServerResponse = JSON.parse(event.data);
        console.log("Received:", response);

        switch (response.type) {
          case "CurrentStatus":
            setActiveUsers(response.data.userIds);
            setAvaterPositions(response.data.positions);
            break;
          case "UpdateActiveUser":
            setActiveUsers(response.data.userIds);
            break;
          case "UpdatePosition":
            // UpdatePositionの処理
            setAvaterPositions((pref) => {
              return {
                ...pref,
                [response.data.userId]: {
                  x: response.data.x,
                  y: response.data.y,
                },
              };
            });
            break;
          case "Ping":
            break;
          default:
            console.warn("Unknown response type:", response);
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
  }, [roomId, setActiveUsers, setAvaterPositions, setSocket, setIsConnected]);

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
      sendCommand(socket, { type: "Ping", initial: false });
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [reconnect, socket]);

  return { socket, isConnected, error, reconnect };
};
