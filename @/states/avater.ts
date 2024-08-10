import { proxy, ref, subscribe } from "valtio";
import { websocketState } from "./websocket";
import { throttledSendColor, throttledSendPosition } from "@/websocket/command";

export type User = {
  position?: { x: number; y: number };
  color?: string;
  reaction: string | null;
};

export const myState = proxy({
  position: { x: 0, y: 0 },
  reaction: null as string | null,
});

export const clearReactionTimer = proxy(
  ref<Record<string, NodeJS.Timeout>>({})
);

export const myColor = proxy({
  color: "black",
});

export const usersState = proxy<{ users: ({ id: string } & User)[] }>({
  users: [],
});

export const addReaction = (userId: string | null, reaction: string) => {
  if (!userId) {
    myState.reaction = reaction;
    if (clearReactionTimer["my"]) {
      clearTimeout(clearReactionTimer["my"]);
    }
    clearReactionTimer["my"] = setTimeout(() => {
      myState.reaction = null;
      delete clearReactionTimer["my"];
    }, 5000);
    return;
  }
  const user = usersState.users.find((user) => user.id === userId);
  if (!user) {
    return;
  }
  user.reaction = reaction;
  if (clearReactionTimer[userId]) {
    clearTimeout(clearReactionTimer[userId]);
  }
  clearReactionTimer[userId] = setTimeout(() => {
    user.reaction = null;
    delete clearReactionTimer[userId];
  }, 5000);
};

export const updateActiveUsers = (userIds: string[]) => {
  usersState.users = userIds.map((id) => ({
    id,
    color: usersState.users.find((user) => user.id === id)?.color,
    position: usersState.users.find((user) => user.id === id)?.position,
    reaction: null,
  }));
};

if (typeof window !== "undefined") {
  subscribe(myState, () => {
    if (websocketState.isConnected && websocketState.socketRef.socket) {
      throttledSendPosition(myState.position);
    }
  });

  subscribe(myColor, () => {
    if (websocketState.isConnected && websocketState.socketRef.socket) {
      throttledSendColor(myColor.color);
    }
  });
}
