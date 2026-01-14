// 파일: src/views/admin/users/UserManageView.tsx
import { useState } from "react";

import styles from "./users.view.module.css";

import { useAdminUsers, useAdminUserDetail, useAdminUserStatusUpdate } from "@/hooks/admin/adminUsers.query";
import type { AdminUserId } from "@/types/admin/user";

export default function UserManageView() {
  // 목록 페이징
  const [page, setPage] = useState(0);

  // 선택된 사용자
  const [selectedUserId, setSelectedUserId] = useState<AdminUserId | null>(null);

  // 상태 변경 입력
  const [status, setStatus] = useState("");

  // 1) 목록 조회
  const usersQuery = useAdminUsers({ page, size: 20 });

  // 2) 상세 조회(선택된 경우만 로드되도록: 기존 NaN 방식 유지)
  const detailUserId = selectedUserId ?? Number.NaN;
  const userDetailQuery = useAdminUserDetail(detailUserId);

  // 3) 상태 변경
  const statusMutation = useAdminUserStatusUpdate();

  const listLoading = usersQuery.isLoading;
  const listError = usersQuery.error;

  const detailLoading = userDetailQuery.isLoading;
  const detailError = userDetailQuery.error;

  const rows = usersQuery.data?.rows ?? [];
  const listMessage = usersQuery.data?.message ?? "";

  const user = userDetailQuery.data?.user;
  const detailMessage = userDetailQuery.data?.message ?? "";

  const onClickPrev = () => setPage((p) => Math.max(0, p - 1));
  const onClickNext = () => setPage((p) => p + 1);

  const onSelectUser = (userId: AdminUserId) => {
    setSelectedUserId(userId);
    setStatus("");
  };

  const onSubmitStatus = async () => {
    if (!selectedUserId) return;
    if (!status) return;

    await statusMutation.mutateAsync({
      userId: selectedUserId,
      body: { status },
    });

    await userDetailQuery.refetch();
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>사용자 관리</h2>

      {listMessage ? <div className={styles.message}>{listMessage}</div> : null}

      <div className={styles.layout}>
        {/* 좌측: 목록 */}
        <section className={styles.panel}>
          <div className={styles.pager}>
            <button type="button" className={styles.btn} onClick={onClickPrev} disabled={page <= 0}>
              이전
            </button>

            <span className={styles.pagerText}>page: {usersQuery.data?.page ?? page}</span>

            <button type="button" className={styles.btn} onClick={onClickNext}>
              다음
            </button>
          </div>

          {listLoading ? <div className={styles.muted}>로딩 중...</div> : null}
          {listError ? <div className={styles.error}>목록 조회 에러가 발생했습니다.</div> : null}

          {!listLoading && !listError ? (
            <ul className={styles.list}>
              {rows.map((u) => {
                const active = selectedUserId === u.userId;
                return (
                  <li key={u.userId} className={styles.listItem}>
                    <button
                      type="button"
                      onClick={() => onSelectUser(u.userId)}
                      className={`${styles.userBtn} ${active ? styles.userBtnActive : ""}`}
                    >
                      userId: {u.userId}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </section>

        {/* 우측: 상세 + 상태변경 */}
        <section className={styles.panel}>
          <h3 className={styles.subTitle}>사용자 상세</h3>

          {!selectedUserId ? (
            <div className={styles.muted}>왼쪽 목록에서 사용자를 선택하세요.</div>
          ) : (
            <>
              {detailMessage ? <div className={styles.message}>{detailMessage}</div> : null}

              {detailLoading ? <div className={styles.muted}>로딩 중...</div> : null}
              {detailError ? <div className={styles.error}>상세 조회 에러가 발생했습니다.</div> : null}

              {!detailLoading && !detailError ? (
                <>
                  <div className={styles.card}>
                    <div>userId: {user?.userId}</div>
                    {/* TODO: AdminUserDetailResponse 필드 확정되면 표시 추가 */}
                  </div>

                  <div className={styles.row}>
                    <input
                      className={styles.input}
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      placeholder="변경할 status"
                    />

                    <button type="button" className={styles.btn} disabled={statusMutation.isPending || !status} onClick={onSubmitStatus}>
                      상태 변경
                    </button>

                    {statusMutation.isPending ? <span className={styles.muted}>처리 중...</span> : null}
                  </div>
                </>
              ) : null}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
