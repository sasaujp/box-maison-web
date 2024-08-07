export type ResponseType =
  | "UpdatePosition"
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

export interface CurrentStatusResponse extends BaseResponse {
  type: "CurrentStatus";
  data: {
    userIds: string[];
    positions: Record<string, { x: number; y: number }>;
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
  | UpdateActiveUserResponse
  | CurrentStatusResponse
  | PingResponse;
