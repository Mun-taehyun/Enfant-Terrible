// src/views/admin/posts.view.tsx
import { useMemo, useRef, useState } from "react";
import styles from "./posts.view.module.css";

import {
  useAdminPosts,
  useAdminPostDetail,
  useAdminPostMutations,
} from "@/hooks/admin/adminPost.hook";

import type {
  AdminPostId,
  AdminPostListItem,
  AdminPostSaveRequest,
} from "@/types/admin/post";

type AdminPostListParams = {
  page: number;
  size: number;
  postType?: string;
  userId?: number;
};

const POST_TYPE_OPTIONS = [
  { label: "공지", value: "NOTICE" },
  { label: "이벤트", value: "EVENT" },
  { label: "상품상세", value: "PRODUCT_DETAIL" },
] as const;

function toNumOrNull(v: string): number | null {
  const s = v.trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function normalizeOrNull(v: string): string | null {
  const s = v.trim();
  return s ? s : null;
}

export default function PostsView() {
  // filters
  const [filterPostType, setFilterPostType] = useState("");
  const [filterUserId, setFilterUserId] = useState("");

  // list
  const {
    data,
    loading,
    errorMsg,
    params,
    setParams,
    setPage,
    setSize,
    refetch,
  } = useAdminPosts({
    page: 1,
    size: 20,
  });

  // selection + detail
  const [selectedPostId, setSelectedPostId] = useState<AdminPostId | null>(null);
  const detail = useAdminPostDetail(selectedPostId);

  const mode: "create" | "update" = selectedPostId == null ? "create" : "update";

  const mutations = useAdminPostMutations(() => {
    refetch();
    detail.refetch();
  });

  const page =
    data?.page ?? ((params as unknown as AdminPostListParams)?.page ?? 1);
  const size =
    data?.size ?? ((params as unknown as AdminPostListParams)?.size ?? 20);
  const totalCount = data?.totalCount ?? 0;

  const list: AdminPostListItem[] = (data?.list ?? []) as AdminPostListItem[];

  const totalPages = useMemo(() => {
    if (size <= 0) return 1;
    return Math.max(1, Math.ceil(totalCount / size));
  }, [totalCount, size]);

  // editor refs (비제어)
  const postTypeRef = useRef<HTMLSelectElement>(null);
  const refTypeRef = useRef<HTMLInputElement>(null);
  const refIdRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // ✅ 렌더 중 ref 접근 금지, effect setState 금지: 선택 타입은 이벤트로만 갱신
  const [editorPostType, setEditorPostType] = useState<string>("");

  const handleApplyFilters = () => {
    const userIdNum = toNumOrNull(filterUserId);
    setParams((prev) => ({
      ...prev,
      page: 1,
      postType: filterPostType.trim() ? filterPostType.trim() : undefined,
      userId: userIdNum == null ? undefined : userIdNum,
    }));
  };

  const handleClearFilters = () => {
    setFilterPostType("");
    setFilterUserId("");
    setParams((prev) => ({
      ...prev,
      page: 1,
      postType: undefined,
      userId: undefined,
    }));
  };

  const handleSelect = (pid: AdminPostId, postType: string) => {
    setSelectedPostId(pid);
    setEditorPostType(postType ?? "");
  };

  const handleNewMode = () => {
    setSelectedPostId(null);
    setEditorPostType("");
  };

  const buildSaveBodyFromRefs = (): AdminPostSaveRequest | null => {
    // select의 value는 백엔드 enum 문자열(NOTICE/EVENT/PRODUCT_DETAIL)
    const postType = (postTypeRef.current?.value ?? "").trim();
    const title = titleRef.current?.value.trim() ?? "";
    const content = contentRef.current?.value.trim() ?? "";

    const refTypeRaw = refTypeRef.current?.value ?? "";
    const refIdText = refIdRef.current?.value ?? "";
    const refId = toNumOrNull(refIdText);

    if (!postType) {
      alert("게시판 종류는 필수입니다.");
      return null;
    }

    if (postType === "PRODUCT_DETAIL" && refId == null) {
      alert("상품상세 게시글은 연결 ID가 필수입니다.");
      return null;
    }

    if (!title) {
      alert("제목은 필수입니다.");
      return null;
    }
    if (!content) {
      alert("내용은 필수입니다.");
      return null;
    }

    return {
      postType,
      title,
      content,
      refType: normalizeOrNull(refTypeRaw),
      refId,
    };
  };

  const handleSubmit = async () => {
    const body = buildSaveBodyFromRefs();
    if (!body) return;

    if (mode === "create") {
      await mutations.create(body);
      alert("게시글 생성 성공");
      handleNewMode();
      return;
    }

    if (selectedPostId == null) {
      alert("수정할 게시글을 선택하세요.");
      return;
    }
    if (detail.notFound) {
      alert("해당 게시글은 존재하지 않습니다. 목록에서 다시 선택해 주세요.");
      return;
    }
    if (!detail.data) {
      alert("상세 로딩이 끝난 뒤 수정할 수 있습니다.");
      return;
    }

    await mutations.update(selectedPostId, body);
    alert("게시글 수정 성공");
    refetch();
    detail.refetch();
  };

  const handleDelete = async () => {
    if (selectedPostId == null) {
      alert("삭제할 게시글을 선택하세요.");
      return;
    }
    if (detail.notFound) {
      alert("해당 게시글은 이미 삭제되었거나 존재하지 않습니다.");
      setSelectedPostId(null);
      setEditorPostType("");
      return;
    }

    const ok = window.confirm(`게시글(ID=${selectedPostId})을 삭제하시겠습니까?`);
    if (!ok) return;

    await mutations.remove(selectedPostId);
    alert("게시글 삭제 성공");
    handleNewMode();
    refetch();
  };

  const editorKey = useMemo(() => {
    if (selectedPostId == null) return "create";

    const d = detail.data;
    if (!d) return `loading-${selectedPostId}`;

    return `update-${d.postId}-${d.updatedAt ?? "na"}`;
  }, [selectedPostId, detail.data]);

  const canSubmit =
    mutations.loading === false &&
    (mode === "create" ||
      (mode === "update" &&
        selectedPostId != null &&
        detail.data != null &&
        detail.notFound === false));

  const initialPostType =
    mode === "update" ? (detail.data?.postType ?? "") : "";
  const initialRefType = mode === "update" ? (detail.data?.refType ?? "") : "";
  const initialRefId =
    mode === "update"
      ? detail.data?.refId == null
        ? ""
        : String(detail.data.refId)
      : "";

  const isProductDetailSelected =
    (editorPostType || initialPostType) === "PRODUCT_DETAIL";

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>게시글 관리</h2>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.btn}
            onClick={refetch}
            disabled={loading}
          >
            새로고침
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {/* LEFT: list + filters */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>목록</div>

            <div className={styles.pager}>
              <label className={styles.label}>
                목록 크기
                <select
                  className={styles.select}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  disabled={loading}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </label>

              <button
                type="button"
                className={styles.btn}
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={loading || page <= 1}
              >
                이전
              </button>

              <span className={styles.pageInfo}>
                {page} / {totalPages} (총 {totalCount}건)
              </span>

              <button
                type="button"
                className={styles.btn}
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={loading || page >= totalPages}
              >
                다음
              </button>
            </div>
          </div>

          <div className={styles.filters}>
            <div className={styles.filterRow}>
              <label className={styles.fLabel}>
                게시판 종류
                <input
                  className={styles.input}
                  value={filterPostType}
                  onChange={(e) => setFilterPostType(e.target.value)}
                  placeholder="예: NOTICE"
                />
              </label>

              <label className={styles.fLabel}>
                작성자 ID
                <input
                  className={styles.input}
                  value={filterUserId}
                  onChange={(e) => setFilterUserId(e.target.value)}
                  placeholder="예: 1"
                />
              </label>

              <button
                type="button"
                className={styles.btn}
                onClick={handleApplyFilters}
                disabled={loading}
              >
                검색
              </button>
              <button
                type="button"
                className={styles.btn}
                onClick={handleClearFilters}
                disabled={loading}
              >
                초기화
              </button>
            </div>
          </div>

          {errorMsg && <div className={styles.error}>목록 오류: {errorMsg}</div>}
          {loading && <div className={styles.loading}>불러오는 중...</div>}

          <div className={styles.list}>
            {list.map((item) => {
              const pid = item.postId;
              const isActive = selectedPostId === pid;

              return (
                <button
                  key={pid}
                  type="button"
                  className={
                    isActive
                      ? `${styles.row} ${styles.rowActive}`
                      : styles.row
                  }
                  onClick={() => handleSelect(pid, item.postType)}
                >
                  <div className={styles.rowTop}>
                    <span className={styles.badge}>게시글 ID: {pid}</span>
                    <span className={styles.badge}>
                      작성자 ID: {item.userId}
                    </span>
                    <span className={styles.badge}>
                      게시판 종류: {item.postType}
                    </span>
                  </div>

                  <div className={styles.rowTitle}>{item.title}</div>

                  <div className={styles.rowMeta}>
                    생성일: {item.createdAt ?? "-"} / 수정일:{" "}
                    {item.updatedAt ?? "-"}
                  </div>
                </button>
              );
            })}

            {!loading && list.length === 0 && (
              <div className={styles.empty}>데이터가 없습니다.</div>
            )}
          </div>
        </section>

        {/* RIGHT: detail + editor */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              상세 / {mode === "create" ? "생성" : "수정"}
            </div>

            <div className={styles.rightActions}>
              <button
                type="button"
                className={styles.btn}
                onClick={handleNewMode}
              >
                신규 작성
              </button>
              <button
                type="button"
                className={styles.btnDanger}
                onClick={handleDelete}
                disabled={mutations.loading}
              >
                삭제
              </button>
            </div>
          </div>

          <div className={styles.detailBox}>
            {selectedPostId == null ? (
              <div className={styles.hint}>
                선택된 게시글이 없습니다. 아래 폼으로 신규 작성할 수 있습니다.
              </div>
            ) : detail.notFound ? (
              <div className={styles.hint}>
                해당 게시글은 존재하지 않습니다(삭제되었거나 접근 불가).
                <div style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    className={styles.btn}
                    onClick={handleNewMode}
                  >
                    선택 해제
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.detailTitle}>
                  선택 게시글 ID: {selectedPostId}
                </div>
                {detail.errorMsg && (
                  <div className={styles.error}>상세 오류: {detail.errorMsg}</div>
                )}
                {detail.loading && (
                  <div className={styles.loading}>상세 불러오는 중...</div>
                )}
                {detail.data && (
                  <pre className={styles.detailPre}>
                    {JSON.stringify(detail.data, null, 2)}
                  </pre>
                )}
              </>
            )}
          </div>

          {/* editor: key 리마운트로 defaultValue 반영 */}
          <div className={styles.editor} key={editorKey}>
            <div className={styles.formGrid}>
              <label className={styles.fLabel}>
                게시판 종류 (필수)
                <select
                  className={styles.select}
                  ref={postTypeRef}
                  defaultValue={initialPostType}
                  required
                  onChange={(e) => setEditorPostType(e.target.value)}
                >
                  <option value="" disabled>
                    선택하세요
                  </option>
                  {POST_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.fLabel}>
                연관 타입
                <input
                  className={styles.input}
                  ref={refTypeRef}
                  defaultValue={initialRefType}
                />
              </label>

              <label className={styles.fLabel}>
                연결 ID
                <input
                  className={styles.input}
                  ref={refIdRef}
                  defaultValue={initialRefId}
                />
                {/* 상품상세일 때만 필수라는 사실만 남기고, 설명 박스/안내 문구는 제거 */}
                {isProductDetailSelected ? null : null}
              </label>

              <label className={styles.fLabelWide}>
                제목 (필수)
                <input
                  className={styles.input}
                  ref={titleRef}
                  defaultValue={mode === "update" ? detail.data?.title ?? "" : ""}
                  placeholder="제목을 입력하세요"
                />
              </label>

              <label className={styles.fLabelWide}>
                내용 (필수)
                <textarea
                  className={styles.textarea}
                  ref={contentRef}
                  defaultValue={
                    mode === "update" ? detail.data?.content ?? "" : ""
                  }
                  placeholder="내용을 입력하세요"
                />
              </label>
            </div>

            {mutations.errorMsg && (
              <div className={styles.error}>저장 오류: {mutations.errorMsg}</div>
            )}

            <div className={styles.editorActions}>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleSubmit}
                disabled={!canSubmit}
              >
                {mode === "create" ? "저장(생성)" : "저장(수정)"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
