import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import styles from "./QnaView.module.css";

import { useAdminQnaRooms } from "@/hooks/admin/adminQna.hook";
import { adminQnaKeys } from "@/querys/admin/adminQna.query";
import type { AdminQnaRoomListItem } from "@/types/admin/qna";

import { useAdminQnaSocket } from "@/hooks/admin/adminQnaSocket.hook";

function toNumberOrUndef(v: string): number | undefined {
  const t = v.trim();
  if (t.length === 0) return undefined;

  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
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

function getAccessToken(): string {
  // 프로젝트에서 실제 키가 다르면 여기만 수정
  const t = localStorage.getItem("accessToken");
  return (t ?? "").trim();
}

export default function QnaRoomsView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [pageInput, setPageInput] = useState<string>("1");
  const [sizeInput, setSizeInput] = useState<string>("20");
  const [userIdInput, setUserIdInput] = useState<string>("");

  const page = useMemo<number>(() => {
    const n = toNumberOrUndef(pageInput);
    return n && n > 0 ? n : 1;
  }, [pageInput]);

  const size = useMemo<number>(() => {
    const n = toNumberOrUndef(sizeInput);
    return n && n > 0 ? n : 20;
  }, [sizeInput]);

  const userId = useMemo<number | undefined>(() => toNumberOrUndef(userIdInput), [userIdInput]);

  const { data, isLoading, isError, error, refetch } = useAdminQnaRooms({
    page,
    size,
    userId,
  });

  const list = useMemo<AdminQnaRoomListItem[]>(() => data?.list ?? [], [data?.list]);
  const totalCount = data?.totalCount ?? 0;

  const totalPages = useMemo<number>(() => {
    const n = Math.ceil(totalCount / size);
    return n <= 0 ? 1 : n;
  }, [totalCount, size]);

  // 실시간 unread 오버라이드
  const [unreadMap, setUnreadMap] = useState<Record<number, number>>({});

  const accessToken = useMemo<string>(() => getAccessToken(), []);

  useAdminQnaSocket({
    token: accessToken,
    subscribeMessage: false,
    subscribeUnread: true,
    subscribeNotify: true,
    onUnread: (p) => {
      setUnreadMap((prev) => ({ ...prev, [p.roomId]: p.unread }));
    },
    onNotify: () => {
      // 새 메시지/알림이 오면 목록 갱신(최소 구현)
      queryClient.invalidateQueries({ queryKey: adminQnaKeys.all });
    },
  });

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <div className={styles.title}>QnA 채팅방 관리</div>
        <div className={styles.muted}>
          총 {totalCount}건 / 페이지 {page} / 페이지당 {size}개
        </div>
      </div>

      <div className={styles.ctrlBar}>
        <div className={styles.ctrlItem}>
          <span className={styles.ctrlLabel}>사용자 ID</span>
          <input
            className={styles.ctrlInput}
            value={userIdInput}
            onChange={(e) => setUserIdInput(e.target.value)}
            placeholder="선택"
            inputMode="numeric"
          />
        </div>

        <div className={styles.ctrlItem}>
          <span className={styles.ctrlLabel}>페이지</span>
          <input
            className={styles.ctrlInput}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            placeholder="1"
            inputMode="numeric"
          />
        </div>

        <div className={styles.ctrlItem}>
          <span className={styles.ctrlLabel}>페이지 크기</span>
          <input
            className={styles.ctrlInput}
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
            placeholder="20"
            inputMode="numeric"
          />
        </div>

        <button className={`${styles.button} ${styles.buttonPrimary}`} onClick={() => refetch()}>
          조회
        </button>

        <button
          className={styles.button}
          onClick={() => setPageInput(String(Math.max(1, page - 1)))}
          disabled={page <= 1}
        >
          이전
        </button>

        <button
          className={styles.button}
          onClick={() => setPageInput(String(Math.min(totalPages, page + 1)))}
          disabled={page >= totalPages}
        >
          다음
        </button>
      </div>

      {isLoading && <div className={styles.muted}>로딩 중...</div>}
      {isError && <div className={styles.error}>{errorText(error)}</div>}

      {!isLoading && !isError && (
        <>
          {list.length === 0 ? (
            <div className={styles.muted}>조회 결과가 없습니다.</div>
          ) : (
            <table className={styles.grid}>
              <thead>
                <tr>
                  <th style={{ width: 120 }}>채팅방</th>
                  <th>채팅방 ID</th>
                  <th>사용자 ID</th>
                  <th>상태</th>
                  <th>마지막 채팅 시간</th>
                  <th>안 읽음</th>
                </tr>
              </thead>
              <tbody>
                {list.map((it) => (
                  <tr key={it.roomId}>
                    <td>
                      <button
                        className={styles.button}
                        onClick={() => navigate(`/admin/qna/${it.roomId}`)}
                      >
                        입장
                      </button>
                    </td>
                    <td>{it.roomId}</td>
                    <td>{it.userId}</td>
                    <td>{it.status}</td>
                    <td>{it.lastMessageAt}</td>
                    <td>{unreadMap[it.roomId] ?? it.unread}</td>
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
