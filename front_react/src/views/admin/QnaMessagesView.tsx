// src/views/admin/QnaMessagesView.tsx
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import styles from "./QnaView.module.css";

import { useAdminQnaMessages } from "@/hooks/admin/adminQna.hook";
import type { AdminQnaMessageItem } from "@/types/admin/qna";

function toRoomId(param: string | undefined): number {
  const n = Number(param);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function errorText(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return "요청 처리 중 오류가 발생했습니다.";
  }
}

export default function QnaMessagesView() {
  const params = useParams();
  const roomId = useMemo(() => toRoomId(params.roomId), [params.roomId]);

  const [limitInput, setLimitInput] = useState<string>("50");
  const limit = useMemo(() => {
    const t = limitInput.trim();
    if (!t) return 50;
    const n = Number(t);
    return Number.isFinite(n) && n > 0 ? n : 50;
  }, [limitInput]);

  const { data, isLoading, isError, error, refetch } = useAdminQnaMessages({
    roomId,
    limit,
  });

  // ✅ 파생 상태(derived state)로 복제하지 않고 그대로 사용 (React 경고 방지)
  const messages = useMemo<AdminQnaMessageItem[]>(
    () => (Array.isArray(data) ? data : []),
    [data]
  );

  const [draft, setDraft] = useState<string>("");

  function onSend() {
    const msg = draft.trim();
    if (!msg) return;
    if (roomId <= 0) return;

    // TODO: WebSocket 연결 후 아래를 publishSend(roomId, msg)로 교체
    // 지금은 UI만 존재 (mock/REST 단계)
    setDraft("");
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <div className={styles.title}>QnA 채팅방</div>
        <div className={styles.muted}>
          <Link to="/admin/qna">← 방 목록</Link>
        </div>
      </div>

      <div className={styles.ctrlBar}>
        <div className={styles.ctrlItem}>
          <span className={styles.ctrlLabel}>최근 메시지</span>
          <input
            className={styles.ctrlInput}
            value={limitInput}
            onChange={(e) => setLimitInput(e.target.value)}
            placeholder="50"
            inputMode="numeric"
          />
        </div>

        <button
          type="button"
          className={`${styles.button} ${styles.buttonPrimary}`}
          onClick={() => refetch()}
          disabled={roomId <= 0}
        >
          새로고침
        </button>
      </div>

      {roomId <= 0 && <div className={styles.error}>잘못된 요청입니다.</div>}

      {isLoading && <div className={styles.muted}>로딩 중...</div>}
      {isError && <div className={styles.error}>{errorText(error)}</div>}

      {!isLoading && !isError && roomId > 0 && (
        <>
          <div className={styles.chatBox}>
            {messages.length === 0 ? (
              <div className={styles.muted}>메시지가 없습니다.</div>
            ) : (
              messages.map((m) => {
                const mine = String(m.sender).toUpperCase() === "ADMIN";
                return (
                  <div
                    key={m.messageId}
                    className={`${styles.chatRow} ${mine ? styles.chatRowMine : ""}`}
                  >
                    <div
                      className={`${styles.bubble} ${
                        mine ? styles.bubbleMine : styles.bubbleOther
                      }`}
                    >
                      <div className={styles.bubbleMeta}>
                        <span className={styles.bubbleSender}>{m.sender}</span>
                        <span className={styles.bubbleTime}>{m.createdAt}</span>
                      </div>
                      <div className={styles.bubbleText} style={{ whiteSpace: "pre-wrap" }}>
                        {m.message}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className={styles.chatInputBar}>
            <textarea
              className={styles.chatInput}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="메시지를 입력하세요"
              rows={2}
            />
            <button
              type="button"
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={onSend}
              disabled={draft.trim().length === 0}
            >
              전송
            </button>
          </div>
        </>
      )}
    </div>
  );
}
