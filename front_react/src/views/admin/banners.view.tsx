// src/views/admin/banners.view.tsx

import { useMemo, useState } from "react";
import styles from "./banners.view.module.css";

import {
  useAdminBanners,
  useAdminBannerDetail,
  useAdminBannerCreate,
  useAdminBannerUpdate,
  useAdminBannerDelete,
} from "@/hooks/admin/adminBanner.hook";

import type {
  AdminBannerId,
  AdminBannerListItem,
  AdminBannerSaveRequest,
} from "@/types/admin/banner";

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
  return s;
}

const DEFAULT_FORM: AdminBannerSaveRequest = {
  title: "",
  linkUrl: "",
  sortOrder: undefined,
  isActive: true,
  startAt: undefined,
  endAt: undefined,
  imageUrl: "",
};

export default function BannersView() {
  // list params
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

  const listQ = useAdminBanners(params);

  // modal
  const [open, setOpen] = useState<boolean>(false);
  const [mode, setMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [editingId, setEditingId] = useState<AdminBannerId | null>(null);

  const detailQ = useAdminBannerDetail(editingId);

  const createM = useAdminBannerCreate();
  const updateM = useAdminBannerUpdate();
  const deleteM = useAdminBannerDelete();

  const [imageFile, setImageFile] = useState<File | null>(null);

  // ✅ initial + draft
  const [draft, setDraft] = useState<Partial<AdminBannerSaveRequest>>({});

  const initialForm: AdminBannerSaveRequest = useMemo(() => {
    if (mode === "CREATE") return { ...DEFAULT_FORM };

    const d = detailQ.data;
    if (!d) return { ...DEFAULT_FORM };

    return {
      title: d.title ?? "",
      linkUrl: d.linkUrl ?? "",
      sortOrder: d.sortOrder ?? undefined,
      isActive: d.isActive ?? true,
      startAt: d.startAt ?? undefined,
      endAt: d.endAt ?? undefined,
      imageUrl: "", // ✅ 응답 DTO에 imageUrl이 없으므로 초기 주입 불가
    };
  }, [mode, detailQ.data]);

  const form: AdminBannerSaveRequest = useMemo(() => {
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

  function openEdit(item: AdminBannerListItem) {
    setMode("EDIT");
    setEditingId(item.bannerId as AdminBannerId);
    setDraft({});
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    resetToCreate();
    setImageFile(null);
  }

  function onChange<K extends keyof AdminBannerSaveRequest>(key: K, value: AdminBannerSaveRequest[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit() {
    const req: AdminBannerSaveRequest = {
      ...form,
      title: (form.title || "").trim(),
      linkUrl: (form.linkUrl || "").trim() || undefined,
      sortOrder: form.sortOrder,
      isActive: form.isActive,
      startAt: form.startAt,
      endAt: form.endAt,
    };

    const formData = new FormData();
    formData.append("req", new Blob([JSON.stringify(req)], { type: "application/json" }));
    if (imageFile) {
      formData.append("image", imageFile);
    }

    if (mode === "CREATE") {
      await createM.mutateAsync(formData);
      closeModal();
      return;
    }

    if (mode === "EDIT" && editingId != null) {
      await updateM.mutateAsync({ bannerId: editingId, body: formData });
      closeModal();
      return;
    }
  }

  async function onDelete(bannerId: AdminBannerId) {
    const ok = window.confirm("삭제하시겠습니까?");
    if (!ok) return;
    await deleteM.mutateAsync(bannerId);
  }

  const totalCount = listQ.data?.totalCount ?? 0;
  const totalPages = useMemo(() => {
    if (!totalCount || !size) return 1;
    return Math.max(1, Math.ceil(totalCount / size));
  }, [totalCount, size]);

  const rows: AdminBannerListItem[] = listQ.data?.list ?? [];

  const isEditLoading = mode === "EDIT" && detailQ.isLoading;
  const disableSubmit =
    createM.isPending ||
    updateM.isPending ||
    isEditLoading ||
    (mode === "EDIT" && !detailQ.data);

  return (
    <section className={styles.wrap}>
      <header className={styles.header}>
        <h1 className={styles.title}>배너 관리</h1>
        <div className={styles.actions}>
          <button className={styles.primaryBtn} onClick={openCreate}>
            배너 생성
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
              <th>배너ID</th>
              <th>제목</th>
              <th>링크</th>
              <th>정렬</th>
              <th>활성</th>
              <th>기간</th>
              <th>생성일</th>
              <th>액션</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r.bannerId}>
                <td>{r.bannerId}</td>
                <td className={styles.tdTitle}>{r.title}</td>
                <td className={styles.tdLink}>{r.linkUrl || "-"}</td>
                <td>{r.sortOrder ?? "-"}</td>
                <td>{r.isActive ? "Y" : "N"}</td>
                <td className={styles.tdPeriod}>
                  {r.startAt || "-"} ~ {r.endAt || "-"}
                </td>
                <td>{r.createdAt || "-"}</td>
                <td className={styles.tdActions}>
                  <button className={styles.grayBtn} onClick={() => openEdit(r)}>
                    수정
                  </button>
                  <button className={styles.dangerBtn} onClick={() => onDelete(r.bannerId as AdminBannerId)}>
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
                {mode === "CREATE" ? "배너 생성" : `배너 수정 (ID: ${editingId})`}
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
                <label className={styles.label}>정렬(sortOrder)</label>
                <input
                  className={styles.input}
                  type="number"
                  value={form.sortOrder ?? ""}
                  onChange={(e) =>
                    onChange("sortOrder", e.target.value === "" ? undefined : Number(e.target.value))
                  }
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
                <label className={styles.label}>이미지 파일</label>
                <input
                  className={styles.input}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                    setImageFile(f);
                  }}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.primaryBtn} onClick={onSubmit} disabled={disableSubmit}>
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
