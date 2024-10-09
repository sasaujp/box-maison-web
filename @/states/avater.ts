import { proxy, ref, subscribe } from "valtio";
import { websocketState } from "./websocket";
import { throttledSendColor, throttledSendPosition } from "@/websocket/command";

export const BUBBLE_REACTIONS = ["❗", "🖐️", "😊", "👍", "👋"];

export type User = {
  position?: { x: number; y: number };
  color?: string;
  reaction: { value: string } | null;
};

export const myState = proxy({
  position: { x: 0, y: 0 },
  reaction: null as { value: string } | null,
  isAvatarOverLink: false,
});

export const clearReactionTimer = proxy(
  ref<Record<string, NodeJS.Timeout>>({})
);

export const myColor = proxy({ color: "#000000" });

export const usersState = proxy<{ users: ({ id: string } & User)[] }>({
  users: [],
});

export const addReaction = (userId: string | null, reaction: string) => {
  if (!userId) {
    myState.reaction = { value: reaction };
    if (clearReactionTimer["my"]) {
      clearTimeout(clearReactionTimer["my"]);
    }
    clearReactionTimer["my"] = setTimeout(
      () => {
        myState.reaction = null;
        console.log("clear reaction", userId);
        delete clearReactionTimer["my"];
      },
      BUBBLE_REACTIONS.includes(reaction) ? 5000 : 100
    );
    return;
  }

  const user = usersState.users.find((user) => user.id === userId);
  if (!user) {
    return;
  }
  user.reaction = { value: reaction };
  if (clearReactionTimer[userId]) {
    clearTimeout(clearReactionTimer[userId]);
  }
  clearReactionTimer[userId] = setTimeout(
    () => {
      user.reaction = null;
      console.log("clear reaction", userId);
      delete clearReactionTimer[userId];
    },
    BUBBLE_REACTIONS.includes(reaction) ? 5000 : 100
  );
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
  const updateColorFromLocalStorage = () => {
    console.log("updateColorFromLocalStorage");
    const storedColor = localStorage.getItem("myColor");
    if (storedColor) {
      const parsedColor = JSON.parse(storedColor);
      myColor.color = parsedColor.color;
    }
  };

  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    setTimeout(updateColorFromLocalStorage, 50);
  }

  subscribe(myColor, () => {
    console.log(myColor.color);
    localStorage.setItem("myColor", JSON.stringify(myColor));
  });
  subscribe(myState, () => {
    if (websocketState.isConnected && websocketState.socketRef.socket) {
      throttledSendPosition(myState.position);
    }
  });

  subscribe(myColor, () => {
    console.log("color changed");
    if (websocketState.isConnected && websocketState.socketRef.socket) {
      throttledSendColor(myColor.color);
    }
  });
}
