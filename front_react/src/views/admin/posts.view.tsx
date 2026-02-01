// src/views/admin/posts.view.tsx
import { useEffect, useMemo, useState } from "react";
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
  userEmail?: string;
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

function toStr(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export default function PostsView() {
  // filters
  const [filterPostType, setFilterPostType] = useState("");
  const [filterUserEmail, setFilterUserEmail] = useState("");

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

  const [isCreateOpen, setIsCreateOpen] = useState(false);

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

  // update form (controlled)
  const [editPostType, setEditPostType] = useState<string>("");
  const [editRefId, setEditRefId] = useState<string>("");
  const [editTitle, setEditTitle] = useState<string>("");
  const [editContent, setEditContent] = useState<string>("");
  const [editFiles, setEditFiles] = useState<File[]>([]);

  // create form (controlled)
  const [createPostType, setCreatePostType] = useState<string>("");
  const [createRefId, setCreateRefId] = useState<string>("");
  const [createTitle, setCreateTitle] = useState<string>("");
  const [createContent, setCreateContent] = useState<string>("");
  const [createFiles, setCreateFiles] = useState<File[]>([]);

  const handleApplyFilters = () => {
    setParams((prev) => ({
      ...prev,
      page: 1,
      postType: filterPostType.trim() ? filterPostType.trim() : undefined,
      userEmail: filterUserEmail.trim() ? filterUserEmail.trim() : undefined,
    }));
  };

  const handleClearFilters = () => {
    setFilterPostType("");
    setFilterUserEmail("");
    setParams((prev) => ({
      ...prev,
      page: 1,
      postType: undefined,
      userEmail: undefined,
    }));
  };

  const handleSelect = (pid: AdminPostId, postType: string) => {
    setSelectedPostId(pid);
    setEditPostType(postType ?? "");
    setEditFiles([]);
  };

  const handleNewMode = () => {
    setCreatePostType("");
    setCreateRefId("");
    setCreateTitle("");
    setCreateContent("");
    setCreateFiles([]);

    setIsCreateOpen(true);
  };

  function buildSaveBodyFromState(v: {
    postType: string;
    refId: string;
    title: string;
    content: string;
  }): AdminPostSaveRequest | null {
    const postType = v.postType.trim();
    const title = v.title.trim();
    const content = v.content.trim();

    const refId = toNumOrNull(v.refId);

    if (!postType) {
      alert("게시판 종류는 필수입니다.");
      return null;
    }

    if (postType === "PRODUCT_DETAIL" && refId == null) {
      alert("상품상세 게시글은 상품이 필요합니다.");
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

    const normalizedRefType = postType === "PRODUCT_DETAIL" ? "PRODUCT" : null;
    const normalizedRefId = postType === "PRODUCT_DETAIL" ? refId : null;

    return {
      postType,
      title,
      content,
      refType: normalizedRefType,
      refId: normalizedRefId,
    };
  }

  function buildFormData(body: AdminPostSaveRequest, files: File[]): FormData {
    const fd = new FormData();
    fd.append("req", new Blob([JSON.stringify(body)], { type: "application/json" }));
    files.forEach((f) => {
      fd.append("files", f);
    });
    return fd;
  }

  const handleCreateSubmit = async () => {
    const body = buildSaveBodyFromState({
      postType: createPostType,
      refId: createRefId,
      title: createTitle,
      content: createContent,
    });
    if (!body) return;

    const formData = buildFormData(body, createFiles);
    await mutations.create(formData);
    alert("게시글 생성 성공");
    setIsCreateOpen(false);
    refetch();
  };

  const handleUpdateSubmit = async () => {
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

    const body = buildSaveBodyFromState({
      postType: editPostType,
      refId: editRefId,
      title: editTitle,
      content: editContent,
    });
    if (!body) return;

    const formData = buildFormData(body, editFiles);
    await mutations.update(selectedPostId, formData);
    alert("게시글 수정 성공");
    refetch();
    detail.refetch();
    setEditFiles([]);
  };

  const handleDelete = async () => {
    if (selectedPostId == null) {
      alert("삭제할 게시글을 선택하세요.");
      return;
    }
    if (detail.notFound) {
      alert("해당 게시글은 이미 삭제되었거나 존재하지 않습니다.");
      setSelectedPostId(null);
      setEditPostType("");
      setEditRefId("");
      setEditTitle("");
      setEditContent("");
      setEditFiles([]);
      return;
    }

    const ok = window.confirm(`게시글을 삭제하시겠습니까?`);
    if (!ok) return;

    await mutations.remove(selectedPostId);
    alert("게시글 삭제 성공");
    setSelectedPostId(null);
    setEditPostType("");
    setEditRefId("");
    setEditTitle("");
    setEditContent("");
    setEditFiles([]);
    refetch();
  };

  const canSubmit =
    mutations.loading === false &&
    mode === "update" &&
    selectedPostId != null &&
    detail.data != null &&
    detail.notFound === false;

  const isUpdateProductDetailSelected = editPostType === "PRODUCT_DETAIL";
  const isCreateProductDetailSelected = createPostType === "PRODUCT_DETAIL";

  useEffect(() => {
    if (selectedPostId == null) {
      setEditPostType("");
      setEditRefId("");
      setEditTitle("");
      setEditContent("");
      setEditFiles([]);
      return;
    }

    if (detail.data) {
      setEditPostType(toStr(detail.data.postType));
      setEditRefId(detail.data.refId == null ? "" : String(detail.data.refId));
      setEditTitle(toStr(detail.data.title));
      setEditContent(toStr(detail.data.content));
    }
  }, [selectedPostId, detail.data]);

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
                <select
                  className={styles.select}
                  value={filterPostType}
                  onChange={(e) => setFilterPostType(e.target.value)}
                  disabled={loading}
                >
                  <option value="">전체</option>
                  {POST_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.fLabel}>
                작성자 이메일
                <input
                  className={styles.input}
                  value={filterUserEmail}
                  onChange={(e) => setFilterUserEmail(e.target.value)}
                  placeholder="user@example.com"
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
                    <span className={styles.badge}>
                      작성자 이메일: {item.userEmail}
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
              상세 / 수정
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

          {selectedPostId == null ? (
            <div className={styles.detailBox}>
              <div className={styles.hint}>
                수정할 게시글을 선택해 주세요.
              </div>
            </div>
          ) : detail.notFound ? (
            <div className={styles.detailBox}>
              <div className={styles.hint}>
                해당 게시글은 존재하지 않습니다(삭제되었거나 접근 불가).
                <div style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    className={styles.btn}
                    onClick={() => setSelectedPostId(null)}
                  >
                    선택 해제
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.editor}>
              {detail.errorMsg && (
                <div className={styles.error}>상세 오류: {detail.errorMsg}</div>
              )}
              {detail.loading && (
                <div className={styles.loading}>상세 불러오는 중...</div>
              )}

              <div className={styles.formGrid}>
                <label className={styles.fLabel}>
                  게시판 종류 (필수)
                  <select
                    className={styles.select}
                    required
                    value={editPostType}
                    onChange={(e) => setEditPostType(e.target.value)}
                    disabled={detail.notFound || detail.loading}
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

                {isUpdateProductDetailSelected ? (
                  <label className={styles.fLabel}>
                    상품
                    <input
                      className={styles.input}
                      value={editRefId}
                      onChange={(e) => setEditRefId(e.target.value)}
                      placeholder="예: 123"
                      disabled={detail.notFound || detail.loading}
                    />
                  </label>
                ) : null}

                <label className={styles.fLabelWide}>
                  제목 (필수)
                  <input
                    className={styles.input}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="제목을 입력하세요"
                    disabled={detail.notFound || detail.loading}
                  />
                </label>

                <label className={styles.fLabelWide}>
                  내용 (필수)
                  <textarea
                    className={styles.textarea}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="내용을 입력하세요"
                    disabled={detail.notFound || detail.loading}
                  />
                </label>

                <label className={styles.fLabelWide}>
                  첨부파일 (선택)
                  <input
                    className={styles.input}
                    type="file"
                    multiple
                    onChange={(e) => {
                      const files = e.target.files ? Array.from(e.target.files) : [];
                      setEditFiles(files);
                    }}
                    disabled={detail.notFound || detail.loading}
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
                  onClick={handleUpdateSubmit}
                  disabled={!canSubmit}
                >
                  저장(수정)
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {isCreateOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsCreateOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3 className={styles.modalTitle}>게시글 신규 작성</h3>
              <button type="button" className={styles.btn} onClick={() => setIsCreateOpen(false)}>
                닫기
              </button>
            </div>

            <div className={styles.formGrid}>
              <label className={styles.fLabel}>
                게시판 종류 (필수)
                <select
                  className={styles.select}
                  required
                  value={createPostType}
                  onChange={(e) => setCreatePostType(e.target.value)}
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

              {isCreateProductDetailSelected ? (
                <label className={styles.fLabel}>
                  상품
                  <input
                    className={styles.input}
                    value={createRefId}
                    onChange={(e) => setCreateRefId(e.target.value)}
                    placeholder="예: 123"
                  />
                </label>
              ) : null}

              <label className={styles.fLabelWide}>
                제목 (필수)
                <input
                  className={styles.input}
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                />
              </label>

              <label className={styles.fLabelWide}>
                내용 (필수)
                <textarea
                  className={styles.textarea}
                  value={createContent}
                  onChange={(e) => setCreateContent(e.target.value)}
                  placeholder="내용을 입력하세요"
                />
              </label>

              <label className={styles.fLabelWide}>
                첨부파일 (선택)
                <input
                  className={styles.input}
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files ? Array.from(e.target.files) : [];
                    setCreateFiles(files);
                  }}
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
                onClick={handleCreateSubmit}
                disabled={mutations.loading}
              >
                저장(생성)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
