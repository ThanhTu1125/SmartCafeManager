import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

/**
 * STOMP over SockJS — kết nối tới backend /ws-news (đã có sẵn BE).
 * Chỉ thêm phía FE, không sửa WebSocketConfig cũ.
 */
let client = null;

export function connectCafeSocket({ onNews, onStaff, onTableEvents, onConnected, onError } = {}) {
  disconnectCafeSocket();

  const sockUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/ws-news`
      : "http://localhost:8080/ws-news";

  client = new Client({
    webSocketFactory: () => new SockJS(sockUrl),
    reconnectDelay: 4000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      onConnected?.();
      if (onNews) {
        client.subscribe("/topic/news", (msg) => onNews(msg.body));
      }
      if (onStaff) {
        client.subscribe("/topic/staff-requests", (msg) => onStaff(msg.body));
      }
      if (onTableEvents) {
        client.subscribe("/topic/table-events", (msg) => onTableEvents(msg.body));
      }
    },
    onStompError: (frame) => {
      onError?.(frame?.headers?.message || "STOMP error");
    },
    onWebSocketError: () => {
      onError?.("Không kết nối được WebSocket");
    },
  });

  client.activate();
  return client;
}

export function disconnectCafeSocket() {
  if (client) {
    try {
      client.deactivate();
    } catch {
      /* ignore */
    }
    client = null;
  }
}
