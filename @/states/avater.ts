import { proxy, subscribe } from "valtio";
import { websocketState } from "./websocket";
import { throttledSendColor, throttledSendPosition } from "@/websocket/command";

export type User = {
  position?: { x: number; y: number };
  color?: string;
};

export const myState = proxy({
  position: { x: 0, y: 0 },
});

export const myColor = proxy({
  color: "black",
});

export const usersState = proxy<{ users: ({ id: string } & User)[] }>({
  users: [],
});

export const updateActiveUsers = (userIds: string[]) => {
  usersState.users = userIds.map((id) => ({
    id,
    color: "black",
    position: usersState.users.find((user) => user.id === id)?.position,
  }));
};

if (typeof window !== "undefined") {
  subscribe(myState, () => {
    if (websocketState.isConnected && websocketState.socketRef.socket) {
      throttledSendPosition(websocketState.socketRef.socket, myState.position);
    }
  });

  subscribe(myColor, () => {
    if (websocketState.isConnected && websocketState.socketRef.socket) {
      throttledSendColor(websocketState.socketRef.socket, myColor.color);
    }
  });
}
