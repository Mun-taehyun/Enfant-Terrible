// src/views/admin/qna/QnaMessagesView.tsx

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

  const messages = useMemo<AdminQnaMessageItem[]>(() => data ?? [], [data]);

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <div className={styles.title}>QnA 메시지</div>
        <div className={styles.muted}>
          <Link to="/admin/qna">← 방 목록</Link>
        </div>
      </div>

      {/* ✅ 한 줄 컨트롤 바 */}
      <div className={styles.ctrlBar}>
        <div className={styles.ctrlItem}>
          <span className={styles.ctrlLabel}>채팅방 ID</span>
          <span className={styles.ctrlValue}>{roomId}</span>
        </div>

        <div className={styles.ctrlItem}>
          <span className={styles.ctrlLabel}>조회 개수</span>
          <input
            className={styles.ctrlInput}
            value={limitInput}
            onChange={(e) => setLimitInput(e.target.value)}
            placeholder="50"
            inputMode="numeric"
          />
        </div>

        <button className={`${styles.button} ${styles.buttonPrimary}`} onClick={() => refetch()}>
          조회
        </button>
      </div>

      {roomId <= 0 && <div className={styles.error}>잘못된 채팅방 ID 입니다.</div>}

      {isLoading && <div className={styles.muted}>로딩 중...</div>}
      {isError && <div className={styles.error}>{errorText(error)}</div>}

      {!isLoading && !isError && (
        <>
          {messages.length === 0 ? (
            <div className={styles.muted}>메시지가 없습니다.</div>
          ) : (
            <table className={styles.grid}>
              <thead>
                <tr>
                  <th>메시지 ID</th>
                  <th>보낸 사람</th>
                  <th>메시지 내용</th>
                  <th>보낸 시간</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => (
                  <tr key={m.messageId}>
                    <td>{m.messageId}</td>
                    <td>{m.sender}</td>
                    <td style={{ whiteSpace: "pre-wrap" }}>{m.message}</td>
                    <td>{m.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
