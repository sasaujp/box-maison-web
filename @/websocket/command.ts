import throttle from "lodash.throttle";

export type CommandType = "UpdatePosition" | "Ping";

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

// Ping コマンド
export interface PingCommand extends BaseCommand {
  type: "Ping";
  initial: boolean;
}

// すべてのコマンドの型
export type Command = UpdatePositionCommand | PingCommand;

export const sendCommand = (socket: WebSocket, command: Command) => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(command));
  } else {
    console.error("WebSocket is not open. ReadyState:", socket.readyState);
  }
};

export const throttledSendPosition = throttle(
  (
    socket: WebSocket,
    position: {
      x: number;
      y: number;
    }
  ) => {
    if (socket.readyState === WebSocket.OPEN) {
      sendCommand(socket, {
        type: "UpdatePosition",
        data: position,
      });
    } else {
      console.error("WebSocket is not open. ReadyState:", socket.readyState);
    }
  },
  100
);
