// src/views/admin/inquiry/ProductInquiriesView.tsx
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
  return n;
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

  // 사용자 수정분만 저장
  const [draftAnswers, setDraftAnswers] = useState<Record<number, string>>({});

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

  const { data, isLoading, error, refetch, isFetching } = useAdminInquiries(
    params
  );

  const upsertAnswer = useAdminInquiryAnswerUpsert();
  const clearAnswer = useAdminInquiryAnswerClear();
  const deleteInquiry = useAdminInquiryDelete();

  const totalCount = data?.totalCount ?? 0;
  const list = data?.list ?? [];
  const totalPages = Math.max(1, Math.ceil(totalCount / (size || 20)));

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

      // 저장 직후에도 입력값 유지
      setDraftAnswers((prev) => ({ ...prev, [row.inquiryId]: draft }));

      // answeredAt/answeredByUserId 반영
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

      await refetch();
      window.alert("문의가 삭제되었습니다.");
    } catch (e: unknown) {
      window.alert(getErrorMessage(e, "문의 삭제에 실패했습니다."));
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>상품 문의 관리</h1>
        <div className={styles.headerRight}>
          <button
            type="button"
            className={styles.button}
            onClick={() => refetch()}
            disabled={isFetching}
          >
            새로고침
          </button>
        </div>
      </header>

      <section className={styles.filters}>
        <div className={styles.filterRow}>
          <label className={styles.label}>
            상품ID
            <input
              className={styles.input}
              value={productIdText}
              onChange={(e) => setProductIdText(e.target.value)}
              placeholder="예: 1"
              inputMode="numeric"
            />
          </label>

          <label className={styles.label}>
            사용자ID
            <input
              className={styles.input}
              value={userIdText}
              onChange={(e) => setUserIdText(e.target.value)}
              placeholder="예: 2"
              inputMode="numeric"
            />
          </label>

          <label className={styles.label}>
            상태
            <input
              className={styles.input}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="예: WAITING / ANSWERED"
            />
          </label>

          <label className={styles.label}>
            페이지
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

          <label className={styles.label}>
            사이즈
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
            <button
              type="button"
              className={styles.buttonPrimary}
              onClick={onClickSearch}
              disabled={isFetching}
            >
              검색
            </button>
            <button
              type="button"
              className={styles.button}
              onClick={onClickReset}
              disabled={isFetching}
            >
              초기화
            </button>
          </div>
        </div>

        <div className={styles.pagingRow}>
          <div className={styles.pagingInfo}>
            총 {totalCount}건 / {page}페이지 (총 {totalPages}페이지)
          </div>
          <div className={styles.pagingButtons}>
            <button
              type="button"
              className={styles.button}
              onClick={() => setPage(1)}
              disabled={page <= 1}
            >
              처음
            </button>
            <button
              type="button"
              className={styles.button}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              이전
            </button>
            <button
              type="button"
              className={styles.button}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              다음
            </button>
            <button
              type="button"
              className={styles.button}
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
            >
              끝
            </button>
          </div>
        </div>
      </section>

      <section className={styles.content}>
        {isLoading && <div className={styles.info}>로딩 중...</div>}
        {error && (
          <div className={styles.error}>
            {error.message || "목록 조회 실패"}
          </div>
        )}

        {!isLoading && !error && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>문의ID</th>
                  <th>상품ID</th>
                  <th>사용자</th>
                  <th>비공개</th>
                  <th>상태</th>
                  <th>문의내용</th>
                  <th>답변</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 && (
                  <tr>
                    <td colSpan={8} className={styles.empty}>
                      데이터가 없습니다.
                    </td>
                  </tr>
                )}

                {list.map((row) => {
                  const draft = getDraftValue(row);

                  return (
                    <tr key={row.inquiryId}>
                      <td className={styles.monoEm}>{row.inquiryId}</td>
                      <td className={styles.monoEm}>{row.productId}</td>

                      <td className={styles.cellValueEm}>
                        <div className={styles.userCell}>
                          <div className={styles.mono}>#{row.userId}</div>
                          <div className={styles.userEmail}>{row.userEmail}</div>
                        </div>
                      </td>

                      <td className={styles.cellValueEm}>
                        {row.isPrivate ? "Y" : "N"}
                      </td>

                      <td className={styles.monoEm}>{row.status}</td>

                      <td>
                        <div className={styles.textCell}>{row.content}</div>
                        <div className={styles.subText}>생성: {row.createdAt}</div>
                      </td>

                      <td>
                        <textarea
                          className={styles.textarea}
                          value={draft}
                          onChange={(e) =>
                            onChangeDraft(row.inquiryId, e.target.value)
                          }
                          placeholder="답변을 입력하세요"
                        />
                        <div className={styles.subText}>
                          {row.answeredAt
                            ? `답변일: ${row.answeredAt} (by #${
                                row.answeredByUserId ?? "-"
                              })`
                            : "답변 없음"}
                        </div>
                      </td>

                      <td>
                        <div className={styles.actions}>
                          <button
                            type="button"
                            className={styles.buttonPrimary}
                            onClick={() => onSaveAnswer(row)}
                            disabled={upsertAnswer.isPending}
                          >
                            저장
                          </button>
                          <button
                            type="button"
                            className={styles.button}
                            onClick={() => onClearAnswer(row)}
                            disabled={clearAnswer.isPending}
                          >
                            답변삭제
                          </button>
                          <button
                            type="button"
                            className={styles.buttonDanger}
                            onClick={() => onDeleteInquiry(row)}
                            disabled={deleteInquiry.isPending}
                          >
                            문의삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
