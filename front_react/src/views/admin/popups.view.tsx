// src/views/admin/popups.view.tsx

import { useMemo, useState } from "react";
import styles from "./popups.view.module.css";

import {
  useAdminPopups,
  useAdminPopupDetail,
  useAdminPopupCreate,
  useAdminPopupUpdate,
  useAdminPopupDelete,
} from "@/hooks/admin/adminPopup.hook";

import type {
  AdminPopupId,
  AdminPopupListItem,
  AdminPopupSaveRequest,
} from "@/types/admin/popup";

type ActiveFilter = "ALL" | "ACTIVE" | "INACTIVE";

function toBoolFilter(v: ActiveFilter): boolean | undefined {
  if (v === "ACTIVE") return true;
  if (v === "INACTIVE") return false;
  return undefined;
}

function toInputDateTimeLocal(iso?: string | null): string {
  if (!iso) return "";
  const s = String(iso);
  const m = s.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
  return m ? m[1] : "";
}

function fromInputDateTimeLocal(v: string): string | undefined {
  const s = (v || "").trim();
  if (!s) return undefined;
  return s; // LocalDateTime 문자열로 그대로 전송
}

const DEFAULT_FORM: AdminPopupSaveRequest = {
  title: "",
  content: "",
  linkUrl: "",
  position: "",
  width: undefined,
  height: undefined,
  isActive: true,
  startAt: undefined,
  endAt: undefined,
  imageUrl: "",
};

export default function PopupsView() {
  // 목록 파라미터
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(20);
  const [title, setTitle] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("ALL");

  const params = useMemo(
    () => ({
      page,
      size,
      title: title.trim() ? title.trim() : undefined,
      isActive: toBoolFilter(activeFilter),
    }),
    [page, size, title, activeFilter]
  );

  const listQ = useAdminPopups(params);

  // 모달 상태
  const [open, setOpen] = useState<boolean>(false);
  const [mode, setMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [editingId, setEditingId] = useState<AdminPopupId | null>(null);

  const detailQ = useAdminPopupDetail(editingId);

  const createM = useAdminPopupCreate();
  const updateM = useAdminPopupUpdate();
  const deleteM = useAdminPopupDelete();

  // ✅ useEffect로 폼 복사하지 않고, 초기값 + draft(사용자 변경분) 방식
  const [draft, setDraft] = useState<Partial<AdminPopupSaveRequest>>({});

  const initialForm: AdminPopupSaveRequest = useMemo(() => {
    if (mode === "CREATE") return { ...DEFAULT_FORM };

    // EDIT 모드: detail이 없으면 일단 기본값(로딩 중)
    const d = detailQ.data;
    if (!d) return { ...DEFAULT_FORM };

    return {
      title: d.title ?? "",
      content: d.content ?? "",
      linkUrl: d.linkUrl ?? "",
      position: d.position ?? "",
      width: d.width ?? undefined,
      height: d.height ?? undefined,
      isActive: d.isActive ?? true,
      startAt: d.startAt ?? undefined,
      endAt: d.endAt ?? undefined,
      imageUrl: "", // 백 detail DTO에 imageUrl이 없어서 빈값 유지
    };
  }, [mode, detailQ.data]);

  const form: AdminPopupSaveRequest = useMemo(() => {
    return { ...initialForm, ...draft };
  }, [initialForm, draft]);

  function resetToCreate() {
    setMode("CREATE");
    setEditingId(null);
    setDraft({});
  }

  function openCreate() {
    resetToCreate();
    setOpen(true);
  }

  function openEdit(item: AdminPopupListItem) {
    setMode("EDIT");
    setEditingId(item.popupId as AdminPopupId);
    setDraft({}); // ✅ 편집 대상 바뀔 때 draft 초기화(이벤트 핸들러에서 setState라 경고 없음)
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    resetToCreate();
  }

  function onChange<K extends keyof AdminPopupSaveRequest>(
    key: K,
    value: AdminPopupSaveRequest[K]
  ) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit() {
// 1. FormData 인스턴스 생성
  const formData = new FormData();

  // 2. 데이터 담기 (필수 및 선택 값들)
  formData.append("title", (form.title || "").trim());
  if (form.content) formData.append("content", form.content.trim());
  if (form.linkUrl) formData.append("linkUrl", form.linkUrl.trim());
  if (form.position) formData.append("position", form.position.trim());
  if (form.imageUrl) formData.append("imageUrl", form.imageUrl.trim());
  
  // 숫자는 문자열로 변환되어 전달됩니다 (서버에서 숫자로 받음)
  if (form.width) formData.append("width", String(form.width));
  if (form.height) formData.append("height", String(form.height));
  
  // 불리언 값 전송
  formData.append("isActive", String(form.isActive ?? true));

  // 날짜 데이터
  if (form.startAt) formData.append("startAt", form.startAt);
  if (form.endAt) formData.append("endAt", form.endAt);

  const bodyForMutation = formData as unknown as AdminPopupSaveRequest;

    if (mode === "CREATE") {
      await createM.mutateAsync(bodyForMutation);
      closeModal();
      return;
    }

    if (mode === "EDIT" && editingId != null) {
      await updateM.mutateAsync({ popupId: editingId, body: bodyForMutation });
      closeModal();
      return;
    }
  }

  async function onDelete(popupId: AdminPopupId) {
    const ok = window.confirm("삭제하시겠습니까?");
    if (!ok) return;
    await deleteM.mutateAsync(popupId);
  }

  // ✅ listQ.data 타입이 확정되어 totalCount/list 에러 제거
  const totalCount = listQ.data?.totalCount ?? 0;
  const totalPages = useMemo(() => {
    if (!totalCount || !size) return 1;
    return Math.max(1, Math.ceil(totalCount / size));
  }, [totalCount, size]);

  const rows: AdminPopupListItem[] = listQ.data?.list ?? [];

  const isEditLoading = mode === "EDIT" && detailQ.isLoading;
  const disableSubmit =
    createM.isPending ||
    updateM.isPending ||
    isEditLoading ||
    (mode === "EDIT" && !detailQ.data);

  return (
    <section className={styles.wrap}>
      <header className={styles.header}>
        <h1 className={styles.title}>팝업 관리</h1>

        <div className={styles.actions}>
          <button className={styles.primaryBtn} onClick={openCreate}>
            팝업 생성
          </button>
        </div>
      </header>

      <div className={styles.filters}>
        <div className={styles.filterItem}>
          <label className={styles.label}>제목</label>
          <input
            className={styles.input}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setPage(1);
            }}
            placeholder="제목 검색"
          />
        </div>

        <div className={styles.filterItem}>
          <label className={styles.label}>활성</label>
          <select
            className={styles.select}
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value as ActiveFilter);
              setPage(1);
            }}
          >
            <option value="ALL">전체</option>
            <option value="ACTIVE">활성</option>
            <option value="INACTIVE">비활성</option>
          </select>
        </div>

        <div className={styles.filterItem}>
          <label className={styles.label}>건수 정렬</label>
          <select
            className={styles.select}
            value={String(size)}
            onChange={(e) => {
              setSize(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>

        <div className={styles.meta}>
          <span>총 {totalCount}건</span>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>팝업ID</th>
              <th>제목</th>
              <th>링크</th>
              <th>포지션</th>
              <th>활성</th>
              <th>기간</th>
              <th>생성일</th>
              <th>액션</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r.popupId}>
                <td>{r.popupId}</td>
                <td className={styles.tdTitle}>{r.title}</td>
                <td className={styles.tdLink}>{r.linkUrl || "-"}</td>
                <td>{r.position || "-"}</td>
                <td>{r.isActive ? "Y" : "N"}</td>
                <td className={styles.tdPeriod}>
                  {r.startAt || "-"} ~ {r.endAt || "-"}
                </td>
                <td>{r.createdAt || "-"}</td>
                <td className={styles.tdActions}>
                  <button className={styles.grayBtn} onClick={() => openEdit(r)}>
                    수정
                  </button>
                  <button
                    className={styles.dangerBtn}
                    onClick={() => onDelete(r.popupId as AdminPopupId)}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className={styles.empty}>
                  데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pager}>
        <button
          className={styles.grayBtn}
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          이전
        </button>

        <div className={styles.pageInfo}>
          {page} / {totalPages}
        </div>

        <button
          className={styles.grayBtn}
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          다음
        </button>
      </div>

      {open && (
        <div className={styles.modalBackdrop} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                {mode === "CREATE" ? "팝업 생성" : `팝업 수정 (ID: ${editingId})`}
              </div>
              <button className={styles.grayBtn} onClick={closeModal}>
                닫기
              </button>
            </div>

            {isEditLoading && <div className={styles.loadingBox}>상세 조회 중...</div>}

            <div className={styles.formGrid}>
              <div className={styles.formItem}>
                <label className={styles.label}>제목 (필수)</label>
                <input
                  className={styles.input}
                  value={form.title}
                  onChange={(e) => onChange("title", e.target.value)}
                />
              </div>

              <div className={styles.formItem}>
                <label className={styles.label}>링크 URL</label>
                <input
                  className={styles.input}
                  value={form.linkUrl || ""}
                  onChange={(e) => onChange("linkUrl", e.target.value)}
                />
              </div>

              <div className={styles.formItem}>
                <label className={styles.label}>포지션</label>
                <input
                  className={styles.input}
                  value={form.position || ""}
                  onChange={(e) => onChange("position", e.target.value)}
                  placeholder="예: TOP_LEFT"
                />
              </div>

              <div className={styles.formItem}>
                <label className={styles.label}>활성</label>
                <select
                  className={styles.select}
                  value={String(form.isActive ?? true)}
                  onChange={(e) => onChange("isActive", e.target.value === "true")}
                >
                  <option value="true">활성</option>
                  <option value="false">비활성</option>
                </select>
              </div>

              <div className={styles.formItem}>
                <label className={styles.label}>너비</label>
                <input
                  className={styles.input}
                  type="number"
                  value={form.width ?? ""}
                  onChange={(e) =>
                    onChange("width", e.target.value === "" ? undefined : Number(e.target.value))
                  }
                />
              </div>

              <div className={styles.formItem}>
                <label className={styles.label}>높이</label>
                <input
                  className={styles.input}
                  type="number"
                  value={form.height ?? ""}
                  onChange={(e) =>
                    onChange("height", e.target.value === "" ? undefined : Number(e.target.value))
                  }
                />
              </div>

              <div className={styles.formItem}>
                <label className={styles.label}>시작일시</label>
                <input
                  className={styles.input}
                  type="datetime-local"
                  value={toInputDateTimeLocal(form.startAt)}
                  onChange={(e) => onChange("startAt", fromInputDateTimeLocal(e.target.value))}
                />
              </div>

              <div className={styles.formItem}>
                <label className={styles.label}>종료일시</label>
                <input
                  className={styles.input}
                  type="datetime-local"
                  value={toInputDateTimeLocal(form.endAt)}
                  onChange={(e) => onChange("endAt", fromInputDateTimeLocal(e.target.value))}
                />
              </div>

              <div className={styles.formItemWide}>
                <label className={styles.label}>이미지 URL</label>
                <input
                  className={styles.input}
                  value={form.imageUrl || ""}
                  onChange={(e) => onChange("imageUrl", e.target.value)}
                />
              </div>

              <div className={styles.formItemWide}>
                <label className={styles.label}>내용</label>
                <textarea
                  className={styles.textarea}
                  value={form.content || ""}
                  onChange={(e) => onChange("content", e.target.value)}
                  rows={6}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.primaryBtn}
                onClick={onSubmit}
                disabled={disableSubmit}
              >
                {mode === "CREATE" ? "생성" : "저장"}
              </button>
              <button className={styles.grayBtn} onClick={closeModal}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
