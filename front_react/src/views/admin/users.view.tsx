// src/views/admin/users.view.tsx

import { useState } from "react";
import styles from "./users.view.module.css";

import {
  useAdminUsers,
  useAdminUserDetail,
  useAdminUserStatusUpdate,
} from "../../hooks/admin/adminUsers.hook";

import type { AdminUserId, AdminUserListItem } from "../../types/admin/user";
import {
  ADMIN_USER_STATUS_LABEL,
  ADMIN_USER_STATUS_OPTIONS,
  type AdminUserStatus,
} from "../../types/admin/user";

/**
 * 상세 정보의 각 행을 렌더링하는 컴포넌트
 */
function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className={styles.infoRow}>
      <div className={styles.labelCell}>{label}</div>
      <div className={styles.valueCell}>
        <span className={styles.displayText}>{value ? value : "-"}</span>
      </div>
      <div className={styles.actionCell} />
    </div>
  );
}

/**
 * 유저 상태 타입 가드
 */
function isAdminUserStatus(v: unknown): v is AdminUserStatus {
  return v === "ACTIVE" || v === "SUSPENDED" || v === "WITHDRAWN";
}

/**
 * 계정 상태 변경 행을 렌더링하는 컴포넌트
 */
function StatusRow({
  status,
  disabled,
  onChange,
}: {
  status: AdminUserStatus;
  disabled: boolean;
  onChange: (next: AdminUserStatus) => void;
}) {
  return (
    <div className={styles.infoRow}>
      <div className={styles.labelCell}>계정상태</div>

      <div className={styles.valueCell}>
        <select
          className={styles.statusSelect}
          value={status}
          disabled={disabled}
          onChange={(e) => {
            const next = e.target.value;
            if (isAdminUserStatus(next)) onChange(next);
          }}
        >
          {ADMIN_USER_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className={styles.statusHint}>
          현재: {ADMIN_USER_STATUS_LABEL[status]} ({status})
        </div>
      </div>

      <div className={styles.actionCell} />
    </div>
  );
}

export default function UsersView() {
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<AdminUserId | null>(null);

  const PAGE_SIZE = 10;

  // 1) 리스트 데이터 조회
  const usersQuery = useAdminUsers({ page, size: PAGE_SIZE });
  const rows: AdminUserListItem[] = usersQuery.data?.rows ?? [];

  // 2) 상세 정보 조회
  const detailQuery = useAdminUserDetail(selectedUserId);
  const user = detailQuery.data?.user;

  // 3) 상태 변경 뮤테이션
  const updateMutation = useAdminUserStatusUpdate();

  // 변경 중 UI에 즉시 반영하기 위한 상태
  const [optimisticStatus, setOptimisticStatus] = useState<AdminUserStatus | null>(
    null
  );

  const serverStatus: AdminUserStatus = isAdminUserStatus(user?.status)
    ? user.status
    : "ACTIVE";

  const currentStatus: AdminUserStatus = optimisticStatus ?? serverStatus;

  // 페이징 관련 계산
  const totalPages =
    typeof usersQuery.data?.totalPages === "number" && usersQuery.data.totalPages >= 1
      ? usersQuery.data.totalPages
      : null;

  const disablePrev = page <= 1;
  const disableNext = totalPages !== null ? page >= totalPages : rows.length < PAGE_SIZE;

  // 상태 변경 핸들러
  const handleStatusChange = async (next: AdminUserStatus) => {
    if (!selectedUserId) return;

    setOptimisticStatus(next);

    try {
      await updateMutation.mutateAsync({
        userId: selectedUserId,
        body: { status: next },
      });

      await detailQuery.refetch();
      await usersQuery.refetch();

      setOptimisticStatus(null);
    } catch (e) {
      console.error(e);
      alert("상태 변경 실패");
      setOptimisticStatus(null);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>사용자 계정 관리</h2>

      <div className={styles.layout}>
        {/* 왼쪽: 사용자 리스트 패널 */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>사용자 리스트</div>

          <div className={styles.listContainer}>
            {usersQuery.isError ? (
              <div className={styles.emptyState}>목록 조회 실패</div>
            ) : rows.length === 0 ? (
              <div className={styles.emptyState}>사용자가 없습니다.</div>
            ) : (
              rows.map((u) => (
                <div
                  key={u.userId}
                  className={`${styles.userItem} ${
                    selectedUserId === u.userId ? styles.activeItem : ""
                  }`}
                  onClick={() => {
                    setSelectedUserId(u.userId);
                    setOptimisticStatus(null);
                  }}
                >
                  <span className={styles.idNo}>#{u.userId}</span>

                  <div className={styles.userMainInfo}>
                    <span className={styles.nameText}>{u.name}</span>
                    <span className={styles.emailText}>{u.email}</span>
                  </div>
                  
                  {/* ✅ 리스트 내 상태 태그(statusTag)가 삭제되었습니다. */}
                </div>
              ))
            )}
          </div>

          {/* ✅ 페이징 버튼이 리스트 하단으로 이동되었습니다. */}
          <div className={styles.pager}>
            <button
              className={styles.pageBtn}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={disablePrev}
            >
              이전
            </button>
            <span className={styles.pageInfo}>PAGE {page}</span>
            <button
              className={styles.pageBtn}
              onClick={() => setPage((p) => p + 1)}
              disabled={disableNext}
            >
              다음
            </button>
          </div>
        </section>

        {/* 오른쪽: 사용자 상세 정보 패널 */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>사용자 상세 정보</div>

          {!user ? (
            <div className={styles.emptyState}>
              사용자를 선택하면 상세 정보가 표시됩니다.
            </div>
          ) : (
            <div className={styles.detailWrapper}>
              <div className={styles.detailBodyBox}>
                <div className={styles.infoTable}>
                  <InfoRow label="이름" value={user.name} />
                  <InfoRow label="회원번호" value={`${user.userId}`} />
                  <InfoRow label="이메일" value={user.email} />
                  <InfoRow label="전화번호" value={user.tel} />
                  <InfoRow label="주소" value={user.address} />

                  <StatusRow
                    status={currentStatus}
                    disabled={updateMutation.isPending}
                    onChange={handleStatusChange}
                  />
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}