import { websocketState } from "@/states/websocket";
import throttle from "lodash.throttle";

export type CommandType =
  | "UpdatePosition"
  | "UpdateColor"
  | "UpdateReaction"
  | "Ping";

// 基本的なコマンド構造
interface BaseCommand {
  type: CommandType;
}

// UpdatePosition コマンド
export interface UpdatePositionCommand extends BaseCommand {
  type: "UpdatePosition";
  data: {
    x: number;
    y: number;
  };
}

// UpdateColor コマンド
export interface UpdateColorCommand extends BaseCommand {
  type: "UpdateColor";
  data: string;
}

// UpdateReaction コマンド
export interface UpdateReactionCommand extends BaseCommand {
  type: "UpdateReaction";
  data: string;
}

// Ping コマンド
export interface PingCommand extends BaseCommand {
  type: "Ping";
  initial: boolean;
}

// すべてのコマンドの型
export type Command =
  | UpdatePositionCommand
  | UpdateColorCommand
  | UpdateReactionCommand
  | PingCommand;

export const sendCommand = (command: Command) => {
  const socket = websocketState.socketRef.socket;
  if (!socket) {
    return;
  }
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(command));
  } else {
    console.error("WebSocket is not open. ReadyState:", socket.readyState);
  }
};

export const throttledSendPosition = throttle(
  (position: { x: number; y: number }) => {
    sendCommand({
      type: "UpdatePosition",
      data: position,
    });
  },
  200
);

export const throttledSendColor = throttle((color: string) => {
  sendCommand({
    type: "UpdateColor",
    data: color,
  });
}, 200);

export const sendReaction = (reaction: string) => {
  sendCommand({
    type: "UpdateReaction",
    data: reaction,
  });
};
