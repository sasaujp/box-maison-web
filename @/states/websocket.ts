import {
  sendCommand,
  throttledSendColor,
  throttledSendPosition,
} from "@/websocket/command";
import { ServerResponse } from "@/websocket/response";
import {
  addReaction,
  myColor,
  myState,
  updateActiveUsers,
  usersState,
} from "./avater";
import { proxy, ref, subscribe } from "valtio";

export const websocketState = proxy({
  roomId: "",
  socketRef: ref<{ socket?: WebSocket }>({}),
  isConnected: false,
  waitConnectTimer: null as NodeJS.Timeout | null,
});

export const websocketConnect = (roomId: string) => {
  disconnect();
  const ws = new WebSocket(`/api/ws/${roomId}`);
  console.log("WebSocket接続中...");
  ws.onopen = () => {
    console.log("WebSocket接続が確立されました");
    sendCommand({ type: "Ping", initial: true });
    websocketState.isConnected = true;
    websocketState.waitConnectTimer = null;
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
              color: user.color,
              reaction: null,
            })
          );
          break;
        case "UpdateActiveUser":
          // UpdateActiveUserの処理
          updateActiveUsers(response.data.userIds);
          break;
        case "UpdateColor":
          usersState.users.find(
            (user) => user.id === response.data.userId
          )!.color = response.data.color;
          break;
        case "UpdatePosition":
          // UpdatePositionの処理
          usersState.users.find(
            (user) => user.id === response.data.userId
          )!.position = response.data;
          break;
        case "UpdateReaction":
          // UpdateReactionの処理
          addReaction(response.data.userId, response.data.reaction);
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
    websocketState.waitConnectTimer = null;
  };

  ws.onclose = (event) => {
    console.log("WebSocket接続が閉じられました", event.code, event.reason);
    websocketState.isConnected = false;
    // setError(event.reason || "WebSocket connection closed");
  };
  websocketState.socketRef.socket = ws;
};

export const disconnect = () => {
  if (websocketState.waitConnectTimer) {
    clearTimeout(websocketState.waitConnectTimer);
    websocketState.waitConnectTimer = null;
  }
  if (websocketState.socketRef.socket) {
    if (websocketState.socketRef.socket.readyState === WebSocket.OPEN) {
      websocketState.socketRef.socket.close();
    }
  }
  websocketState.socketRef.socket = undefined;
  websocketState.isConnected = false;
  websocketState.roomId = "";
};

const ping = () => {
  setTimeout(() => {
    sendCommand({ type: "Ping", initial: false });
    if (
      websocketState.socketRef.socket &&
      websocketState.socketRef.socket.readyState === WebSocket.OPEN &&
      websocketState.isConnected
    ) {
      ping();
    }
  }, 5000);
};

if (typeof window !== "undefined") {
  subscribe(websocketState, () => {
    if (
      !websocketState.isConnected &&
      !websocketState.waitConnectTimer &&
      websocketState.roomId.length > 0
    ) {
      // 0.5秒待つ
      websocketState.waitConnectTimer = setTimeout(() => {
        websocketConnect(websocketState.roomId);
      }, 500);
    }
  });

  subscribe(websocketState, () => {
    if (websocketState.isConnected && websocketState.socketRef.socket) {
      throttledSendPosition(myState.position);
      throttledSendColor(myColor.color);
      ping();
    }
  });
}
