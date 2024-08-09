import { sendCommand } from "@/websocket/command";
import { ServerResponse } from "@/websocket/response";
import { updateActiveUsers, usersState } from "./avater";
import { proxy, ref, subscribe } from "valtio";

export const websocketState = proxy({
  roomId: "",
  socketRef: ref<{ socket?: WebSocket }>({}),
  isConnected: false,
});

export const websocketConnect = (roomId: string) => {
  console.log("WebSocket", WebSocket);
  const ws = new WebSocket(`/api/ws/${roomId}`);
  console.log("WebSocket接続中...");
  ws.onopen = () => {
    console.log("WebSocket接続が確立されました");
    sendCommand(ws, { type: "Ping", initial: true });
    websocketState.isConnected = true;
    // setError(null);
  };

  ws.onmessage = (event) => {
    try {
      const response: ServerResponse = JSON.parse(event.data);
      console.log("Received:", response);

      switch (response.type) {
        case "CurrentStatus":
          usersState.users = Object.entries(response.data.users).map(
            ([id, user]) => ({
              id,
              position: user.position,
            })
          );
          break;
        case "UpdateActiveUser":
          // UpdateActiveUserの処理
          updateActiveUsers(response.data.userIds);
          break;
        case "UpdatePosition":
          // UpdatePositionの処理
          usersState.users.find(
            (user) => user.id === response.data.userId
          )!.position = response.data;
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
    // setError("WebSocket connection error");
  };

  ws.onclose = (event) => {
    console.log("WebSocket接続が閉じられました", event.code, event.reason);
    websocketState.isConnected = false;
    // setError(event.reason || "WebSocket connection closed");
  };
  websocketState.socketRef.socket = ws;
};

if (typeof window !== "undefined") {
  subscribe(websocketState, () => {
    if (!websocketState.isConnected && websocketState.roomId.length > 0) {
      websocketConnect(websocketState.roomId);
    }
  });
}
