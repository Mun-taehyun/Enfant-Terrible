// src/views/admin/payments.view.tsx
import { useMemo, useState } from "react";
import styles from "./payments.view.module.css";

import {
  useAdminPaymentCancel,
  useAdminPaymentDetail,
  useAdminPayments,
} from "@/hooks/admin/adminPayment.hook";
import type { AdminPaymentListParams } from "@/types/admin/payment";

function toNumberOrUndef(v: string): number | undefined {
  const s = v.trim();
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

export default function PaymentsView() {
  // 목록 조건
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(20);

  const [userId, setUserId] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");
  const [orderCode, setOrderCode] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<string>("");

  // 상세/환불
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [cancelAmount, setCancelAmount] = useState<string>("");
  const [cancelReason, setCancelReason] = useState<string>("");

  const params: AdminPaymentListParams = useMemo(() => {
    return {
      page,
      size,
      userId: toNumberOrUndef(userId),
      orderId: toNumberOrUndef(orderId),
      orderCode: orderCode.trim() || undefined,
      paymentStatus: paymentStatus.trim() || undefined,
    };
  }, [page, size, userId, orderId, orderCode, paymentStatus]);

  const listQ = useAdminPayments(params);
  const detailQ = useAdminPaymentDetail(selectedPaymentId);
  const cancelM = useAdminPaymentCancel();

  const list = listQ.data?.list ?? [];
  const totalCount = listQ.data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / size));

  function onSearch() {
    setPage(1);
  }

  function onReset() {
    setUserId("");
    setOrderId("");
    setOrderCode("");
    setPaymentStatus("");
    setPage(1);
    setSize(20);
  }

  function openDetail(paymentId: number) {
    setSelectedPaymentId(paymentId);
    setCancelAmount("");
    setCancelReason("");
  }

  function closeDetail() {
    setSelectedPaymentId(null);
    setCancelAmount("");
    setCancelReason("");
  }

  async function onCancel() {
    if (selectedPaymentId == null) return;

    const amt = Number(cancelAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      alert("환불 금액을 정확히 입력하세요.");
      return;
    }

    try {
      await cancelM.mutateAsync({
        paymentId: selectedPaymentId,
        body: { amount: amt, reason: cancelReason.trim() || undefined },
      });
      alert("환불 처리 완료");
      closeDetail();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "환불 요청에 실패했습니다.";
      alert(msg);
    }
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1 className={styles.title}>결제 관리</h1>
      </header>

      <section className={styles.filters}>
        <div className={styles.row}>
          <label className={styles.field}>
            <span className={styles.label}>회원 ID</span>
            <input
              className={styles.input}
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="숫자"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>주문 ID</span>
            <input
              className={styles.input}
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="숫자"
            />
          </label>

          <label className={styles.fieldWide}>
            <span className={styles.label}>주문 코드</span>
            <input
              className={styles.input}
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
              placeholder="ET2026..."
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>결제 상태</span>
            <input
              className={styles.input}
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              placeholder="PAID / CANCELED ..."
            />
          </label>
        </div>

        <div className={styles.row}>
          <label className={styles.field}>
            <span className={styles.label}>목록 크기</span>
            <select
              className={styles.select}
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>

          <div className={styles.actions}>
            <button className={styles.btn} onClick={onSearch} disabled={listQ.isFetching}>
              조회
            </button>
            <button className={styles.btnGhost} onClick={onReset} disabled={listQ.isFetching}>
              초기화
            </button>
          </div>
        </div>
      </section>

      <section className={styles.tableArea}>
        {listQ.isLoading ? (
          <div className={styles.notice}>로딩 중...</div>
        ) : listQ.isError ? (
          <div className={styles.notice}>
            오류: {listQ.error instanceof Error ? listQ.error.message : "목록 조회 실패"}
          </div>
        ) : (
          <>
            <div className={styles.meta}>
              <span>총 {totalCount}건</span>
              <span>
                페이지: {page} / {totalPages}
              </span>
            </div>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>결제 ID</th>
                  <th>주문 ID</th>
                  <th>회원 ID</th>
                  <th>주문 코드</th>
                  <th>결제 수단</th>
                  <th>결제 금액</th>
                  <th>결제 상태</th>
                  <th>PG 거래 ID</th>
                  <th>결제 일시</th>
                  <th>상세</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={10} className={styles.empty}>
                      데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  list.map((p) => (
                    <tr key={p.paymentId}>
                      <td>{p.paymentId}</td>
                      <td>{p.orderId}</td>
                      <td>{p.userId}</td>
                      <td className={styles.mono}>{p.orderCode}</td>
                      <td>{p.paymentMethod}</td>
                      <td>{p.paymentAmount.toLocaleString()}</td>
                      <td>{p.paymentStatus}</td>
                      <td className={styles.mono}>{p.pgTid}</td>
                      <td className={styles.mono}>{p.paidAt ?? "-"}</td>
                      <td>
                        <button className={styles.btnSmall} onClick={() => openDetail(p.paymentId)}>
                          보기
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className={styles.pager}>
              <button
                className={styles.btnSmall}
                onClick={() => setPage((v) => Math.max(1, v - 1))}
                disabled={page <= 1 || listQ.isFetching}
              >
                이전
              </button>
              <span className={styles.pagerInfo}>페이지 {page}</span>
              <button
                className={styles.btnSmall}
                onClick={() => setPage((v) => Math.min(totalPages, v + 1))}
                disabled={page >= totalPages || listQ.isFetching}
              >
                다음
              </button>
            </div>
          </>
        )}
      </section>

      {/* 상세 모달 (✅ isSuccess로 data 안전 처리) */}
      {selectedPaymentId != null && (
        <div className={styles.modalBackdrop} onClick={closeDetail}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>결제 상세</h2>
              <button className={styles.btnSmall} onClick={closeDetail}>
                닫기
              </button>
            </div>

            {detailQ.isLoading ? (
              <div className={styles.notice}>상세 로딩 중...</div>
            ) : detailQ.isError ? (
              <div className={styles.notice}>
                오류: {detailQ.error instanceof Error ? detailQ.error.message : "상세 조회 실패"}
              </div>
            ) : !detailQ.isSuccess ? (
              <div className={styles.notice}>상세 데이터를 불러오지 못했습니다.</div>
            ) : (
              (() => {
                const d = detailQ.data;

                return (
                  <>
                    <div className={styles.detailGrid}>
                      <div>
                        <b>결제 ID</b> {d.paymentId}
                      </div>
                      <div>
                        <b>주문 ID</b> {d.orderId}
                      </div>
                      <div>
                        <b>회원 ID</b> {d.userId}
                      </div>
                      <div className={styles.mono}>
                        <b>주문 코드</b> {d.orderCode}
                      </div>
                      <div>
                        <b>결제 수단</b> {d.paymentMethod}
                      </div>
                      <div>
                        <b>결제 금액</b> {d.paymentAmount.toLocaleString()}
                      </div>
                      <div>
                        <b>결제 상태</b> {d.paymentStatus}
                      </div>
                      <div className={styles.mono}>
                        <b>PG 거래 ID</b> {d.pgTid}
                      </div>
                      <div className={styles.mono}>
                        <b>결제 일시</b> {d.paidAt ?? "-"}
                      </div>
                      <div className={styles.mono}>
                        <b>생성일</b> {d.createdAt}
                      </div>
                      <div className={styles.mono}>
                        <b>수정일</b> {d.updatedAt}
                      </div>
                    </div>

                    <hr className={styles.hr} />

                    <h3 className={styles.subTitle}>환불 처리</h3>
                    <div className={styles.cancelBox}>
                      <label className={styles.field}>
                        <span className={styles.label}>환불 금액</span>
                        <input
                          className={styles.input}
                          value={cancelAmount}
                          onChange={(e) => setCancelAmount(e.target.value)}
                          placeholder="결제금액과 동일"
                        />
                      </label>

                      <label className={styles.fieldWide}>
                        <span className={styles.label}>환불 사유</span>
                        <input
                          className={styles.input}
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          placeholder="사유(선택)"
                        />
                      </label>

                      <button className={styles.btnDanger} onClick={onCancel} disabled={cancelM.isPending}>
                        환불(취소) 처리
                      </button>
                    </div>
                  </>
                );
              })()
            )}
          </div>
        </div>
      )}
    </div>
  );
}
