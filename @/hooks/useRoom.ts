import { websocketState } from "@/states/websocket";
import { sendCommand } from "@/websocket/command";
import { useEffect } from "react";

export const useRoom = () => {
  // const [error, setError] = useState<string | null>(null);

  // ping
  useEffect(() => {
    if (!websocketState.isConnected || !websocketState.socketRef.socket) {
      return;
    }

    const interval = setInterval(() => {
      if (
        !websocketState.socketRef.socket ||
        websocketState.socketRef.socket.readyState !== WebSocket.OPEN
      ) {
        return;
      }
      sendCommand(websocketState.socketRef.socket, {
        type: "Ping",
        initial: false,
      });
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // return { error };
};
