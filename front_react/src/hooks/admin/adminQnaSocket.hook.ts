import { Client } from "@stomp/stompjs";
import type { IMessage, StompSubscription } from "@stomp/stompjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type QnaWsMessagePayload = {
  roomId: number;
  messageId: number;
  sender: "ADMIN" | "USER" | string;
  message: string;
  createdAt: string;
};

export type QnaWsUnreadPayload = {
  roomId: number;
  unread: number;
};

export type QnaWsNotifyPayload = {
  roomId: number;
  sender: "ADMIN" | "USER" | string;
  preview: string;
};

type UseAdminQnaSocketOptions = {
  token: string;
  onMessage?: (p: QnaWsMessagePayload) => void;
  onUnread?: (p: QnaWsUnreadPayload) => void;
  onNotify?: (p: QnaWsNotifyPayload) => void;

  subscribeMessage?: boolean;
  subscribeUnread?: boolean;
  subscribeNotify?: boolean;
};

function safeParse<T>(body: string): T | null {
  try {
    return JSON.parse(body) as T;
  } catch {
    return null;
  }
}

function defer(fn: () => void) {
  queueMicrotask(fn);
}

export function useAdminQnaSocket(opts: UseAdminQnaSocketOptions) {
  const {
    token,
    onMessage,
    onUnread,
    onNotify,
    subscribeMessage = true,
    subscribeUnread = true,
    subscribeNotify = true,
  } = opts;

  const tokenMemo = useMemo(() => token.trim(), [token]);

  // VITE_WS_URL을 쓰고 있으면 그대로 사용, 없으면 기본값
  const wsUrl = useMemo(() => {
    const fromEnv = import.meta.env.VITE_WS_URL?.trim();
    return fromEnv && fromEnv.length > 0 ? fromEnv : "ws://localhost:8080/ws";
  }, []);

  const [connected, setConnected] = useState<boolean>(false);

  const clientRef = useRef<Client | null>(null);
  const subsRef = useRef<StompSubscription[]>([]);

  const clearSubs = useCallback(() => {
    for (const s of subsRef.current) {
      try {
        s.unsubscribe();
      } catch {
        // ignore
      }
    }
    subsRef.current = [];
  }, []);

  const deactivateClient = useCallback(() => {
    const c = clientRef.current;
    clientRef.current = null;

    clearSubs();

    if (c) {
      try {
        c.deactivate();
      } catch {
        // ignore
      }
    }
  }, [clearSubs]);

  useEffect(() => {
    if (!tokenMemo) {
      deactivateClient();
      defer(() => setConnected(false));
      return;
    }

    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: { Authorization: `Bearer ${tokenMemo}` },
      reconnectDelay: 1500,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {},
    });

    clientRef.current = client;

    client.onConnect = () => {
      setConnected(true);
      clearSubs();

      if (subscribeMessage) {
        subsRef.current.push(
          client.subscribe("/topic/qna/admin/messages", (m: IMessage) => {
            const p = safeParse<QnaWsMessagePayload>(m.body);
            if (p) onMessage?.(p);
          })
        );
      }

      if (subscribeUnread) {
        subsRef.current.push(
          client.subscribe("/topic/qna/admin/unread", (m: IMessage) => {
            const p = safeParse<QnaWsUnreadPayload>(m.body);
            if (p) onUnread?.(p);
          })
        );
      }

      if (subscribeNotify) {
        subsRef.current.push(
          client.subscribe("/topic/qna/admin/notify", (m: IMessage) => {
            const p = safeParse<QnaWsNotifyPayload>(m.body);
            if (p) onNotify?.(p);
          })
        );
      }
    };

    client.onWebSocketClose = () => setConnected(false);
    client.onStompError = () => setConnected(false);

    client.activate();

    return () => {
      deactivateClient();
      defer(() => setConnected(false));
    };
  }, [
    tokenMemo,
    wsUrl,
    subscribeMessage,
    subscribeUnread,
    subscribeNotify,
    onMessage,
    onUnread,
    onNotify,
    clearSubs,
    deactivateClient,
  ]);

  const publishSend = useCallback(
    (roomId: number, message: string) => {
      const c = clientRef.current;
      if (!c || !connected) return;

      c.publish({
        destination: "/app/qna.send",
        body: JSON.stringify({ roomId, message }),
      });
    },
    [connected]
  );

  const publishRead = useCallback(
    (roomId: number, lastReadMessageId: number) => {
      const c = clientRef.current;
      if (!c || !connected) return;

      c.publish({
        destination: "/app/qna.read",
        body: JSON.stringify({ roomId, lastReadMessageId }),
      });
    },
    [connected]
  );

  return { connected, publishSend, publishRead };
}
