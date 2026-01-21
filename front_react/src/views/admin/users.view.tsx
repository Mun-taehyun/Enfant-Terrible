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

// ✅ 포인트 패널(이 파일은 제가 이전에 준 컴포넌트 그대로 쓰시면 됩니다)
import PointsPanel from "@/components/admin/PointsPanel";

/** 상세 정보 한 행 */
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

/** 백엔드 enum(UserStatus)와 1:1 */
function isAdminUserStatus(v: unknown): v is AdminUserStatus {
  return v === "ACTIVE" || v === "SUSPENDED" || v === "DELETED";
}

/** 계정 상태 변경 행 */
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

/**
 * usersQuery.data가 {} / unknown 으로 잡혀도,
 * totalCount/list 접근에서 TS 에러 안 나게 하는 안전 파서
 */
function parseAdminPageResponse(data: unknown): { list: AdminUserListItem[]; totalCount: number } {
  if (!data || typeof data !== "object") return { list: [], totalCount: 0 };

  const d = data as Record<string, unknown>;

  const list = Array.isArray(d.list) ? (d.list as AdminUserListItem[]) : [];
  const totalCount = typeof d.totalCount === "number" ? d.totalCount : 0;

  return { list, totalCount };
}

export default function UsersView() {
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<AdminUserId | null>(null);

  const PAGE_SIZE = 10;

  const usersQuery = useAdminUsers({ page, size: PAGE_SIZE });

  // ✅ 여기서 타입 추론이 {}여도 안전하게 처리
  const { list: rows, totalCount } = parseAdminPageResponse(usersQuery.data);

  const totalPages = totalCount > 0 ? Math.ceil(totalCount / PAGE_SIZE) : 1;

  const disablePrev = page <= 1;
  const disableNext = page >= totalPages;

  // ✅ 백엔드: GET /api/admin/users/{userId}
  const detailQuery = useAdminUserDetail(selectedUserId);
  const user = detailQuery.data;

  // ✅ 상태 변경
  const updateMutation = useAdminUserStatusUpdate();

  // optimistic 적용
  const [optimisticStatus, setOptimisticStatus] = useState<AdminUserStatus | null>(null);

  const serverStatus: AdminUserStatus = isAdminUserStatus(user?.status)
    ? user.status
    : "ACTIVE";

  const currentStatus: AdminUserStatus = optimisticStatus ?? serverStatus;

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
                    <span className={styles.nameText}>{u.name ?? "-"}</span>
                    <span className={styles.emailText}>{u.email}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={styles.pager}>
            <button
              className={styles.pageBtn}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={disablePrev}
            >
              이전
            </button>
            <span className={styles.pageInfo}>
              PAGE {page} / {totalPages} (총 {totalCount}명)
            </span>
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
                  <InfoRow label="회원번호" value={String(user.userId)} />
                  <InfoRow label="이메일" value={user.email} />
                  <InfoRow label="이름" value={user.name} />
                  <InfoRow label="전화번호" value={user.tel} />
                  <InfoRow label="권한" value={user.role} />
                  <InfoRow label="가입경로" value={user.provider} />
                  <InfoRow
                    label="이메일 인증"
                    value={
                      typeof user.emailVerified === "boolean"
                        ? user.emailVerified
                          ? "인증"
                          : "미인증"
                        : null
                    }
                  />
                  <InfoRow label="가입일" value={user.createdAt} />
                  <InfoRow label="마지막 로그인" value={user.lastLoginAt} />

                  <StatusRow
                    status={currentStatus}
                    disabled={updateMutation.isPending}
                    onChange={handleStatusChange}
                  />

                  {/* pets 표시(DTO에 존재) - UI 필요 없으면 이 블록 제거 가능 */}
                  {Array.isArray(user.pets) && user.pets.length > 0 ? (
                    <div className={styles.petsBox}>
                      <div className={styles.petsTitle}>반려동물 정보</div>
                      {user.pets.map((p) => (
                        <div key={p.petId} className={styles.petItem}>
                          <div className={styles.petLine}>
                            <span className={styles.petLabel}>이름</span>
                            <span className={styles.petValue}>{p.name ?? "-"}</span>
                          </div>
                          <div className={styles.petLine}>
                            <span className={styles.petLabel}>종</span>
                            <span className={styles.petValue}>{p.species ?? "-"}</span>
                          </div>
                          <div className={styles.petLine}>
                            <span className={styles.petLabel}>품종</span>
                            <span className={styles.petValue}>{p.breed ?? "-"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                {/* ✅ 포인트 패널: 사용자 상세 하단 */}
                <div style={{ marginTop: 16 }}>
                  <PointsPanel userId={Number(user.userId)} />
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
