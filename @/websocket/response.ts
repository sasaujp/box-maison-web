export type ResponseType =
  | "UpdatePosition"
  | "UpdateColor"
  | "UpdateReaction"
  | "UpdateActiveUser"
  | "CurrentStatus"
  | "Ping";

// 基本的なコマンド構造
interface BaseResponse {
  type: ResponseType;
}

interface UpdatePositionResponse extends BaseResponse {
  type: "UpdatePosition";
  data: {
    userId: string;
    x: number;
    y: number;
  };
}

interface UpdateColorResponse extends BaseResponse {
  type: "UpdateColor";
  data: {
    userId: string;
    color: string;
  };
}

interface UpdateReactionResponse extends BaseResponse {
  type: "UpdateReaction";
  data: {
    userId: string;
    reaction: string;
  };
}

export interface CurrentStatusResponse extends BaseResponse {
  type: "CurrentStatus";
  data: {
    users: Record<
      string,
      { position: { x: number; y: number }; color: string }
    >;
  };
}

export interface UpdateActiveUserResponse extends BaseResponse {
  type: "UpdateActiveUser";
  data: {
    userIds: string[];
  };
}

interface PingResponse extends BaseResponse {
  type: "Ping";
}

export const sendResponse = (socket: WebSocket, response: ServerResponse) => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(response));
  } else {
    console.error("WebSocket is not open. ReadyState:", socket.readyState);
  }
};

// すべてのコマンドの型
export type ServerResponse =
  | UpdatePositionResponse
  | UpdateColorResponse
  | UpdateReactionResponse
  | UpdateActiveUserResponse
  | CurrentStatusResponse
  | PingResponse;
