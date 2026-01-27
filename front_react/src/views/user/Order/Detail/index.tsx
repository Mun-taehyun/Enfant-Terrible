import { useParams } from 'react-router-dom';
import { orderQueries } from '@/querys/user/queryhooks'; // 쿼리 팩토리 경로

export default function OrderDetailView() {
  const { orderId } = useParams<{ orderId: string }>();

  // 1. 리액트 쿼리로 데이터 직접 조회
  const { data: orderData, isLoading, isError } = orderQueries.useGetOrderMyDetail(Number(orderId));

  if (isLoading) return <div className="loading-state">데이터를 불러오는 중...</div>;
  if (isError || !orderData) return <div className="error-state">주문 정보를 찾을 수 없습니다.</div>;

  const formatDate = (date: string | null) => 
    date ? date.replace('T', ' ').substring(0, 16).replace(/-/g, '.') : '-';

  return (
    <div className="order-detail-container">
      {/* 주문 번호 및 날짜 */}
      <div className="detail-header">
        <div className="header-title">주문 상세 내역</div>
        <div className="header-meta">
          <div className="meta-item">주문번호: <strong>{orderData.orderCode}</strong></div>
          <div className="meta-item">주문일시: {formatDate(orderData.orderedAt)}</div>
        </div>
      </div>

      {/* 상품 정보 섹션 */}
      <div className="detail-section">
        <div className="section-title">주문 상품 정보</div>
        <div className="product-list">
          {orderData.items.map((item) => (
            <div key={item.skuId} className="product-card">
              <div className="product-main">
                <div className="product-name">{item.productName}</div>
                <div className="product-option">수량: {item.quantity}개</div>
              </div>
              <div className="product-price">
                <div className="current-price">{(item.price * item.quantity).toLocaleString()}원</div>
                <div className="status-text">{orderData.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 배송지 정보 섹션 (전부 div로 구성) */}
      <div className="detail-section">
        <div className="section-title">배송지 정보</div>
        <div className="info-grid">
          <div className="info-row">
            <div className="info-label">받는 분</div>
            <div className="info-value">{orderData.receiverName}</div>
          </div>
          <div className="info-row">
            <div className="info-label">연락처</div>
            <div className="info-value">{orderData.receiverPhone}</div>
          </div>
          <div className="info-row">
            <div className="info-label">배송주소</div>
            <div className="info-value">
              ({orderData.zipCode}) {orderData.addressBase} {orderData.addressDetail}
            </div>
          </div>
          <div className="info-row">
            <div className="info-label">송장번호</div>
            <div className="info-value">{orderData.trackingNumber || '배송 준비 중'}</div>
          </div>
        </div>
      </div>

      {/* 결제 정보 섹션 */}
      <div className="detail-section no-border">
        <div className="section-title">최종 결제 정보</div>
        <div className="payment-box">
          <div className="payment-row">
            <div className="payment-label">주문 금액</div>
            <div className="payment-value">{orderData.totalAmount.toLocaleString()}원</div>
          </div>
          <div className="payment-row total">
            <div className="total-label">총 결제 금액</div>
            <div className="total-value">{orderData.totalAmount.toLocaleString()}원</div>
          </div>
        </div>
      </div>

      <div className="bottom-actions">
        <div className="back-button" onClick={() => window.history.back()}>목록으로 돌아가기</div>
      </div>
    </div>
  );
}