// src/views/admin/ProductInquiriesView.tsx
import { useMemo, useState } from "react";
import styles from "./ProductInquiriesView.module.css";

import type { AdminProductInquiryListItem } from "@/types/admin/inquiry";
import {
  useAdminInquiries,
  useAdminInquiryAnswerClear,
  useAdminInquiryAnswerUpsert,
  useAdminInquiryDelete,
} from "@/hooks/admin/adminInquiry.hook";

function toIntOrUndef(v: string): number | undefined {
  const s = v.trim();
  if (!s) return undefined;
  const n = Number(s);
  if (!Number.isFinite(n)) return undefined;
  return Math.floor(n);
}

function getErrorMessage(err: unknown, fallback = "요청에 실패했습니다."): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const maybeMessage = (err as { message?: unknown }).message;
    if (typeof maybeMessage === "string") return maybeMessage;
  }
  return fallback;
}

export default function ProductInquiriesView() {
  const [productIdText, setProductIdText] = useState("");
  const [userIdText, setUserIdText] = useState("");
  const [status, setStatus] = useState<string>("");

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);

  const [draftAnswers, setDraftAnswers] = useState<Record<number, string>>({});
  const [openIds, setOpenIds] = useState<Record<number, boolean>>({});

  const params = useMemo(() => {
    const productId = toIntOrUndef(productIdText);
    const userId = toIntOrUndef(userIdText);
    return {
      productId,
      userId,
      status: status.trim() ? status.trim() : undefined,
      page,
      size,
    };
  }, [productIdText, userIdText, status, page, size]);

  const { data, isLoading, error, refetch, isFetching } = useAdminInquiries(params);

  const upsertAnswer = useAdminInquiryAnswerUpsert();
  const clearAnswer = useAdminInquiryAnswerClear();
  const deleteInquiry = useAdminInquiryDelete();

  const totalCount = data?.totalCount ?? 0;
  const list = data?.list ?? [];
  const totalPages = Math.max(1, Math.ceil(totalCount / (size || 20)));

  const goPage = (p: number) => {
    const next = Math.min(Math.max(1, p), totalPages);
    setPage(next);
  };

  const onClickSearch = () => {
    setPage(1);
    refetch();
  };

  const onClickReset = () => {
    setProductIdText("");
    setUserIdText("");
    setStatus("");
    setPage(1);
    setSize(20);
    setDraftAnswers({});
    setOpenIds({});
    refetch();
  };

  const onToggleOpen = (id: number) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const onChangeDraft = (inquiryId: number, v: string) => {
    setDraftAnswers((prev) => ({ ...prev, [inquiryId]: v }));
  };

  function getDraftValue(row: AdminProductInquiryListItem): string {
    const v = draftAnswers[row.inquiryId];
    return v !== undefined ? v : row.answerContent ?? "";
  }

  const onSaveAnswer = async (row: AdminProductInquiryListItem) => {
    const draft = getDraftValue(row).trim();
    if (!draft) {
      window.alert("답변 내용은 비어 있을 수 없습니다.");
      return;
    }

    try {
      await upsertAnswer.mutateAsync({
        inquiryId: row.inquiryId,
        body: { answerContent: draft },
      });

      setDraftAnswers((prev) => ({ ...prev, [row.inquiryId]: draft }));
      await refetch();
      window.alert("답변이 저장되었습니다.");
    } catch (e: unknown) {
      window.alert(getErrorMessage(e, "답변 저장에 실패했습니다."));
    }
  };

  const onClearAnswer = async (row: AdminProductInquiryListItem) => {
    const ok = window.confirm("답변을 삭제하시겠습니까?");
    if (!ok) return;

    try {
      await clearAnswer.mutateAsync({ inquiryId: row.inquiryId });

      setDraftAnswers((prev) => {
        const next = { ...prev };
        delete next[row.inquiryId];
        return next;
      });

      await refetch();
      window.alert("답변이 삭제되었습니다.");
    } catch (e: unknown) {
      window.alert(getErrorMessage(e, "답변 삭제에 실패했습니다."));
    }
  };

  const onDeleteInquiry = async (row: AdminProductInquiryListItem) => {
    const ok = window.confirm("문의를 삭제하시겠습니까?");
    if (!ok) return;

    try {
      await deleteInquiry.mutateAsync({ inquiryId: row.inquiryId });

      setDraftAnswers((prev) => {
        const next = { ...prev };
        delete next[row.inquiryId];
        return next;
      });

      setOpenIds((prev) => {
        const next = { ...prev };
        delete next[row.inquiryId];
        return next;
      });

      await refetch();
      window.alert("문의가 삭제되었습니다.");
    } catch (e: unknown) {
      window.alert(getErrorMessage(e, "문의 삭제에 실패했습니다."));
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.title}>상품 문의 관리</h1>
        <div className={styles.topActions}>
          <button type="button" className={styles.btn} onClick={() => refetch()} disabled={isFetching}>
            새로고침
          </button>
        </div>
      </div>

      {/* 검색 카드 */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>검색 조건</div>

          <div className={styles.cardHeaderRight}>
            <div className={styles.pageSummary}>
              총 <b>{totalCount}</b>건 · <b>{page}</b>/<b>{totalPages}</b>페이지
            </div>

            <div className={styles.pager}>
              <button type="button" className={styles.btn} onClick={() => goPage(1)} disabled={page <= 1}>
                처음
              </button>
              <button type="button" className={styles.btn} onClick={() => goPage(page - 1)} disabled={page <= 1}>
                이전
              </button>
              <button type="button" className={styles.btn} onClick={() => goPage(page + 1)} disabled={page >= totalPages}>
                다음
              </button>
              <button type="button" className={styles.btn} onClick={() => goPage(totalPages)} disabled={page >= totalPages}>
                끝
              </button>
            </div>
          </div>
        </div>

        <div className={styles.filtersGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>상품ID</span>
            <input className={styles.input} value={productIdText} onChange={(e) => setProductIdText(e.target.value)} inputMode="numeric" />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>사용자ID</span>
            <input className={styles.input} value={userIdText} onChange={(e) => setUserIdText(e.target.value)} inputMode="numeric" />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>상태</span>
            <select
              className={styles.select}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">전체</option>
              <option value="WAITING">WAITING</option>
              <option value="ANSWERED">ANSWERED</option>
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>페이지</span>
            <input
              className={styles.input}
              value={String(page)}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (Number.isFinite(n)) setPage(Math.max(1, Math.floor(n)));
              }}
              inputMode="numeric"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>사이즈</span>
            <select
              className={styles.select}
              value={String(size)}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (Number.isFinite(n)) {
                  setSize(n);
                  setPage(1);
                }
              }}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </label>

          <div className={styles.filterButtons}>
            <button type="button" className={styles.btnPrimary} onClick={onClickSearch} disabled={isFetching}>
              검색
            </button>
            <button type="button" className={styles.btn} onClick={onClickReset} disabled={isFetching}>
              초기화
            </button>
          </div>
        </div>
      </section>

      {/* 목록 카드 */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>문의 목록</div>
          <div className={styles.cardHeaderRight}>{isFetching ? <div className={styles.muted}>조회 중...</div> : null}</div>
        </div>

        {isLoading ? <div className={styles.info}>로딩 중...</div> : null}
        {error ? <div className={styles.errorBox}>{error.message || "목록 조회 실패"}</div> : null}

        {!isLoading && !error ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                {/* ✅ 헤더도 동일한 5칸 그리드로 “균형” 고정 */}
                <tr className={styles.gridRow}>
                  <th className={styles.thCell}>문의ID</th>
                  <th className={styles.thCell}>상품ID</th>
                  <th className={styles.thCell}>사용자</th>
                  <th className={`${styles.thCell} ${styles.thCenter}`}>상태</th>
                  <th className={`${styles.thCell} ${styles.thRight}`}>작업</th>
                </tr>
              </thead>

              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.empty}>
                      데이터가 없습니다.
                    </td>
                  </tr>
                ) : null}

                {list.map((row) => {
                  const isOpen = !!openIds[row.inquiryId];
                  const draft = getDraftValue(row);
                  const saved = (row.answerContent ?? "").trim();

                  return (
                    <>
                      {/* ✅ 요약행: 5칸 균형 그리드 (데이터 길이에 영향 안 받음) */}
                      <tr key={`sum-${row.inquiryId}`} className={`${styles.gridRow} ${styles.summaryRow}`}>
                        <td className={styles.tdCell}>
                          <span className={styles.idValue}>{row.inquiryId}</span>
                        </td>

                        <td className={styles.tdCell}>
                          <span className={styles.idValue}>{row.productId}</span>
                        </td>

                        <td className={styles.tdCell}>
                          <div className={styles.userCell}>
                            <span className={styles.userIdValue}>{row.userId}</span>
                            <span className={styles.userEmail}>{row.userEmail}</span>
                          </div>
                        </td>

                        <td className={`${styles.tdCell} ${styles.centerCell}`}>
                          <span className={`${styles.badge} ${styles.badgeStatus}`}>{row.status}</span>
                        </td>

                        <td className={`${styles.tdCell} ${styles.rightCell}`}>
                          <div className={styles.actionRow}>
                            <button type="button" className={styles.btn} onClick={() => onToggleOpen(row.inquiryId)}>
                              {isOpen ? "접기" : "보기"}
                            </button>
                            <button
                              type="button"
                              className={styles.btnDanger}
                              onClick={() => onDeleteInquiry(row)}
                              disabled={deleteInquiry.isPending}
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* 상세행: 기존처럼 아래에서만 내용/답변 길어짐 */}
                      {isOpen ? (
                        <tr key={`det-${row.inquiryId}`} className={styles.detailRow}>
                          <td colSpan={5} className={styles.detailCell}>
                            <div className={styles.detailGrid}>
                              <div className={styles.detailBlock}>
                                <div className={styles.blockTitle}>문의내용</div>
                                <div className={styles.blockBody}>{row.content}</div>
                                <div className={styles.metaText}>생성: {row.createdAt}</div>
                              </div>

                              <div className={styles.detailBlock}>
                                <div className={styles.blockTitle}>답변</div>

                                {saved ? (
                                  <div className={styles.answerPreview}>
                                    <div className={styles.answerPreviewBody}>{saved}</div>
                                  </div>
                                ) : (
                                  <div className={styles.answerEmpty}>저장된 답변 없음</div>
                                )}

                                <div className={styles.answerEditTitle}>답변 작성/수정</div>
                                <textarea
                                  className={styles.textarea}
                                  value={draft}
                                  onChange={(e) => onChangeDraft(row.inquiryId, e.target.value)}
                                />

                                <div className={styles.detailButtons}>
                                  <button
                                    type="button"
                                    className={styles.btnPrimary}
                                    onClick={() => onSaveAnswer(row)}
                                    disabled={upsertAnswer.isPending}
                                  >
                                    저장
                                  </button>
                                  <button
                                    type="button"
                                    className={styles.btn}
                                    onClick={() => onClearAnswer(row)}
                                    disabled={clearAnswer.isPending}
                                  >
                                    답변삭제
                                  </button>
                                </div>

                                <div className={styles.metaText}>
                                  {row.answeredAt
                                    ? `답변일: ${row.answeredAt} (by ${row.answeredByUserId ?? "-"})`
                                    : "답변 이력 없음"}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
