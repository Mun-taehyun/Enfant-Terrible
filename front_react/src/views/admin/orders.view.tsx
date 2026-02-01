// src/views/admin/orders.view.tsx
import { useMemo, useState } from "react";
import styles from "./orders.view.module.css";

import {
  useAdminOrders,
  useAdminOrderDetail,
  useAdminOrderStatusUpdate,
  useAdminOrderShippingStart,
  useAdminOrderCancelItems,
} from "@/hooks/admin/adminOrders.hook";

import type {
  AdminOrderListParams,
  AdminOrderListItem,
  AdminOrderDetail,
  AdminOrderStatus,
  AdminOrderSortBy,
  AdminOrderCancelPayload,
} from "@/types/admin/order";

/* =========================
 * utils
 * ========================= */
function toInt(v: string, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function fmtMoney(v: number | null | undefined): string {
  if (typeof v !== "number") return "-";
  return v.toLocaleString();
}

function fmtDateTime(v: string | null | undefined): string {
  return v && v.trim() ? v : "-";
}

function fmtOrderItemSummary(firstProductName?: string | null, itemCount?: number | null | undefined): string {
  const name = firstProductName && firstProductName.trim() ? firstProductName.trim() : "-";
  const cnt = typeof itemCount === "number" ? itemCount : 0;
  if (cnt <= 1) return name;
  return `${name} 외 ${cnt - 1}개`;
}

/* =========================
 * UI constants
 * ========================= */
const ORDER_STATUS_OPTIONS: ReadonlyArray<{ value: AdminOrderStatus; label: string }> = [
  { value: "PAID", label: "결제완료" },
  { value: "PREPARING", label: "상품준비중" },
  { value: "SHIPPING", label: "배송중" },
  { value: "DELIVERED", label: "배송완료" },
  { value: "CANCELLED", label: "취소" },
];

const ORDER_SORT_BY_OPTIONS: ReadonlyArray<{ value: AdminOrderSortBy; label: string }> = [
  { value: "ORDER_ID", label: "주문번호" },
  { value: "TOTAL_AMOUNT", label: "결제금액" },
  { value: "SHIPPED_AT", label: "배송시작일" },
  { value: "DELIVERED_AT", label: "배송완료일" },
];

const ORDER_DIRECTION_OPTIONS: ReadonlyArray<{ value: "ASC" | "DESC"; label: string }> = [
  { value: "DESC", label: "내림차순" },
  { value: "ASC", label: "오름차순" },
];

/* =========================
 * components
 * ========================= */
function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  const show = value === null || value === undefined || value === "" ? "-" : String(value);

  return (
    <div className={styles.infoRow}>
      <div className={styles.labelCell}>{label}</div>
      <div className={styles.valueCell}>{show}</div>
    </div>
  );
}

/* =========================
 * view
 * ========================= */
export default function OrdersView() {
  // list filters
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(20);

  const [keywordUserEmail, setKeywordUserEmail] = useState<string>("");
  const [keywordOrderCode, setKeywordOrderCode] = useState<string>("");

  const [status, setStatus] = useState<AdminOrderStatus | "">("");
  const [sortBy, setSortBy] = useState<AdminOrderSortBy>("ORDER_ID");
  const [direction, setDirection] = useState<"ASC" | "DESC">("DESC");

  const params: AdminOrderListParams = useMemo(
    () => ({
      page,
      size,
      userEmail: keywordUserEmail.trim() ? keywordUserEmail.trim() : undefined,
      orderCode: keywordOrderCode.trim() ? keywordOrderCode.trim() : undefined,
      status: status ? status : undefined,
      sortBy,
      direction,
    }),
    [page, size, keywordUserEmail, keywordOrderCode, status, sortBy, direction]
  );

  // selection
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // status update
  const [statusDirty, setStatusDirty] = useState<boolean>(false);
  const [nextStatus, setNextStatus] = useState<AdminOrderStatus | "">("");

  // shipping start
  const [trackingNumber, setTrackingNumber] = useState<string>("");

  // cancel
  const [cancelReason, setCancelReason] = useState<string>("");
  const [cancelQuantities, setCancelQuantities] = useState<Record<number, string>>({});

  // queries
  const listQuery = useAdminOrders(params);
  const detailQuery = useAdminOrderDetail(selectedOrderId);

  const order: AdminOrderDetail | null = detailQuery.data ?? null;

  // mutations
  const updateStatusMut = useAdminOrderStatusUpdate();
  const shippingStartMut = useAdminOrderShippingStart();
  const cancelItemsMut = useAdminOrderCancelItems();

  // list data
  const rows: AdminOrderListItem[] = listQuery.data?.list ?? [];
  const totalCount: number = listQuery.data?.totalCount ?? 0;
  const totalPages: number = size > 0 ? Math.max(1, Math.ceil(totalCount / size)) : 1;

  const disablePrev = page <= 1;
  const disableNext = page >= totalPages;

  const onSelect = (orderId: number) => {
    setSelectedOrderId(orderId);

    // UI reset
    setStatusDirty(false);
    setNextStatus("");
    setTrackingNumber("");
    setCancelReason("");
    setCancelQuantities({});
  };

  const statusValue: AdminOrderStatus | "" = statusDirty ? nextStatus : order?.status ?? "";

  const onSubmitStatus = async () => {
    if (!order) return;

    const finalStatus: AdminOrderStatus | "" = statusDirty ? nextStatus : order.status;
    if (!finalStatus) {
      alert("변경할 주문 상태를 선택해 주세요.");
      return;
    }

    await updateStatusMut.mutateAsync({
      orderId: order.orderId,
      body: { status: finalStatus },
    });

    setStatusDirty(false);
    setNextStatus("");

    await detailQuery.refetch();
    await listQuery.refetch();
    alert("주문 상태 변경 완료");
  };

  const onSubmitShippingStart = async () => {
    if (!order) return;

    const tn = trackingNumber.trim();
    if (!tn) {
      alert("운송장 번호를 입력해 주세요.");
      return;
    }

    await shippingStartMut.mutateAsync({
      orderId: order.orderId,
      body: { trackingNumber: tn },
    });

    setTrackingNumber("");

    await detailQuery.refetch();
    await listQuery.refetch();
    alert("배송 시작 처리 완료");
  };

  const onSubmitCancel = async () => {
    if (!order) return;

    const items = (order.items ?? [])
      .map((it) => {
        const raw = cancelQuantities[it.skuId];
        const qty = toInt(String(raw ?? "").trim(), 0);
        return { skuId: it.skuId, quantity: qty };
      })
      .filter((x) => x.quantity && x.quantity > 0);

    if (items.length === 0) {
      alert("취소할 상품과 수량을 입력해 주세요.");
      return;
    }

    const payload: AdminOrderCancelPayload = {
      items,
      reason: cancelReason.trim() ? cancelReason.trim() : undefined,
    };

    await cancelItemsMut.mutateAsync({
      orderId: order.orderId,
      body: payload,
    });

    setCancelReason("");
    setCancelQuantities({});

    await detailQuery.refetch();
    await listQuery.refetch();
    alert("부분취소 처리 완료");
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>주문 관리</h2>

      <div className={styles.layout}>
        {/* LEFT: list */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>주문 목록</div>

          <div className={styles.controls}>
            <div className={styles.controlItem}>
              <span className={styles.controlLabel}>이메일</span>
              <input
                className={styles.input}
                value={keywordUserEmail}
                onChange={(e) => setKeywordUserEmail(e.target.value)}
                placeholder="예: user@example.com"
              />
            </div>

            <div className={styles.controlItem}>
              <span className={styles.controlLabel}>주문코드</span>
              <input
                className={styles.input}
                value={keywordOrderCode}
                onChange={(e) => setKeywordOrderCode(e.target.value)}
                placeholder="예: ET20260110-0001"
              />
            </div>

            <div className={styles.controlItem}>
              <span className={styles.controlLabel}>상태</span>
              <select
                className={styles.select}
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as AdminOrderStatus | "");
                  setPage(1);
                }}
              >
                <option value="">전체</option>
                {ORDER_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.controlItem}>
              <span className={styles.controlLabel}>정렬</span>
              <select
                className={styles.select}
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as AdminOrderSortBy);
                  setPage(1);
                }}
              >
                {ORDER_SORT_BY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.controlItem}>
              <span className={styles.controlLabel}>방향</span>
              <select
                className={styles.select}
                value={direction}
                onChange={(e) => {
                  setDirection(e.target.value as "ASC" | "DESC");
                  setPage(1);
                }}
              >
                {ORDER_DIRECTION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.controlItem}>
              <span className={styles.controlLabel}>개수</span>
              <select
                className={styles.select}
                value={size}
                onChange={(e) => {
                  setSize(toInt(e.target.value, 20));
                  setPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <button type="button" className={styles.smallBtn} onClick={() => listQuery.refetch()}>
              새로고침
            </button>
          </div>

          <div className={styles.listContainer}>
            {listQuery.isPending ? (
              <div className={styles.emptyState}>로딩...</div>
            ) : listQuery.isError ? (
              <div className={styles.emptyState}>목록 조회 실패</div>
            ) : rows.length === 0 ? (
              <div className={styles.emptyState}>주문이 없습니다.</div>
            ) : (
              rows.map((o) => (
                <div
                  key={o.orderId}
                  className={`${styles.listItem} ${
                    selectedOrderId === o.orderId ? styles.activeItem : ""
                  }`}
                  onClick={() => onSelect(o.orderId)}
                >
                  <div className={styles.listMain}>
                    <div className={styles.listTop}>
                      <span className={styles.orderCode}>{o.orderCode}</span>
                    </div>
                    <div className={styles.listSub}>
                      <span>이메일: {o.userEmail}</span>
                      <span>주문상품: {fmtOrderItemSummary(o.firstProductName, o.itemCount)}</span>
                      <span>상태: {o.status}</span>
                      <span>금액: {fmtMoney(o.totalAmount)}원</span>
                    </div>
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
              PAGE {page} / {totalPages} (총 {totalCount}건)
            </span>
            <button
              className={styles.pageBtn}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={disableNext}
            >
              다음
            </button>
          </div>
        </section>

        {/* RIGHT: detail */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>주문 상세</div>

          {!order ? (
            <div className={styles.emptyState}>주문을 선택하면 상세 정보가 표시됩니다.</div>
          ) : (
            <div className={styles.detailContainer}>
              <div className={styles.detailCard}>
                <div className={styles.cardTitle}>주문 정보</div>
                <div className={styles.infoTable}>
                  <InfoRow label="이메일" value={order.userEmail} />
                  <InfoRow label="주문코드" value={order.orderCode} />
                  <InfoRow label="주문상태" value={order.status} />
                  <InfoRow label="결제금액" value={`${fmtMoney(order.totalAmount)}원`} />
                </div>
              </div>

              <div className={styles.detailCard}>
                <div className={styles.cardTitle}>배송 정보</div>
                <div className={styles.infoTable}>
                  <InfoRow label="수령인" value={order.receiverName} />
                  <InfoRow label="연락처" value={order.receiverPhone} />
                  <InfoRow label="우편번호" value={order.zipCode} />
                  <InfoRow label="기본주소" value={order.addressBase} />
                  <InfoRow label="상세주소" value={order.addressDetail} />
                  <InfoRow label="운송장번호" value={order.trackingNumber} />
                  <InfoRow label="배송시작" value={fmtDateTime(order.shippedAt)} />
                  <InfoRow label="배송완료" value={fmtDateTime(order.deliveredAt)} />
                </div>
              </div>

              <div className={styles.detailCard}>
                <div className={styles.cardTitle}>주문 상태 변경</div>

                <div className={styles.inlineRow}>
                  <select
                    className={styles.select}
                    value={statusValue}
                    onChange={(e) => {
                      setStatusDirty(true);
                      setNextStatus(e.target.value as AdminOrderStatus | "");
                    }}
                  >
                    <option value="">선택</option>
                    {ORDER_STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className={styles.primaryBtn}
                    onClick={onSubmitStatus}
                    disabled={updateStatusMut.isPending}
                  >
                    {updateStatusMut.isPending ? "처리 중..." : "상태 변경"}
                  </button>
                </div>

                {updateStatusMut.isError ? (
                  <div className={styles.errorBox}>
                    {(updateStatusMut.error as Error)?.message || "상태 변경에 실패했습니다."}
                  </div>
                ) : null}
              </div>

              <div className={styles.detailCard}>
                <div className={styles.cardTitle}>배송 시작 처리</div>

                <div className={styles.inlineRow}>
                  <input
                    className={styles.input}
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="운송장 번호 입력"
                  />
                  <button
                    type="button"
                    className={styles.primaryBtn}
                    onClick={onSubmitShippingStart}
                    disabled={shippingStartMut.isPending}
                  >
                    {shippingStartMut.isPending ? "처리 중..." : "배송 시작"}
                  </button>
                </div>

                {shippingStartMut.isError ? (
                  <div className={styles.errorBox}>
                    {(shippingStartMut.error as Error)?.message ||
                      "배송 시작 처리에 실패했습니다."}
                  </div>
                ) : null}
              </div>

              <div className={styles.detailCard}>
                <div className={styles.cardTitle}>부분취소</div>

                <div className={styles.cancelGrid}>
                  {(order.items ?? []).map((it) => {
                    const remaining = it.remainingQuantity ?? it.quantity;
                    const key = it.skuId;
                    const value = cancelQuantities[key] ?? "";
                    return (
                      <div key={it.skuId} className={styles.cancelField}>
                        <div className={styles.cancelLabel}>
                          {it.productName} (잔여 {remaining})
                        </div>
                        <input
                          className={styles.input}
                          value={value}
                          onChange={(e) =>
                            setCancelQuantities((prev) => ({
                              ...prev,
                              [key]: e.target.value,
                            }))
                          }
                          placeholder="취소 수량(0이면 미취소)"
                        />
                      </div>
                    );
                  })}

                  <div className={styles.cancelReasonRow}>
                    <div className={styles.cancelReasonLeft}>
                      <div className={styles.cancelLabel}>취소 사유(선택)</div>
                      <input
                        className={styles.input}
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="예: 고객 변심"
                      />
                    </div>

                    <button
                      type="button"
                      className={styles.primaryBtn}
                      onClick={onSubmitCancel}
                      disabled={cancelItemsMut.isPending}
                    >
                      {cancelItemsMut.isPending ? "처리 중..." : "부분취소 실행"}
                    </button>
                  </div>
                </div>

                {cancelItemsMut.isError ? (
                  <div className={styles.errorBox}>
                    {(cancelItemsMut.error as Error)?.message || "부분취소 처리에 실패했습니다."}
                  </div>
                ) : null}
              </div>

              <div className={styles.detailCard}>
                <div className={styles.cardTitle}>주문 상품</div>

                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>상품명</th>
                        <th>단가</th>
                        <th>수량</th>
                        <th>취소수량</th>
                        <th>잔여수량</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(order.items ?? []).map((it) => (
                        <tr key={it.skuId}>
                          <td>{it.productName}</td>
                          <td>{fmtMoney(it.price)}원</td>
                          <td>{it.quantity}</td>
                          <td>{it.cancelledQuantity ?? 0}</td>
                          <td>{it.remainingQuantity ?? it.quantity}</td>
                        </tr>
                      ))}

                      {(order.items?.length ?? 0) === 0 ? (
                        <tr>
                          <td colSpan={5} className={styles.emptyCell}>
                            데이터가 없습니다.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>

              {detailQuery.isError ? (
                <div className={styles.errorBox}>
                  {(detailQuery.error as Error)?.message || "상세 조회에 실패했습니다."}
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
