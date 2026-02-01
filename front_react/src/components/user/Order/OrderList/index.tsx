import { MyOrderListItem } from "@/apis/user/response/order/my-order-list-item-response.dto";
import './style.css';
import { useNavigate } from "react-router-dom";
import { ORDER_DETAIL_PATH, ORDER_PATH } from "@/constant/user/route.index";

interface Props {
    item : MyOrderListItem;
}


export const OrderList = ({ item } : Props) => {
  const navigate = useNavigate();

  // 날짜 변환 (YYYY.MM.DD)
  const formatDate = (date :string) => date ? date.split('T')[0].replace(/-/g, '.') : null;

  return (
        <div className="order-card-container">
        {/* 주문 헤더: 날짜, 번호 */}
            <div className="order-header-group">
                <div className="order-date-text">{formatDate(item.orderedAt)} 주문</div>
                <div className="order-code-text">주문번호 {item.orderCode}</div>
            </div>

            <div className="order-main-content">
                {/* 상품 썸네일 영역 */}
                <div className="product-image-area">
                    <img src={item.representativeThumbnailUrl} alt="product" className="thumb-img" />
                </div>

                {/* 주문 상세 정보 영역 */}
                <div className="order-detail-area">
                <div className="status-timeline-row">
                    <div className={`status-label ${item.status.toLowerCase()}`}>
                    {item.status}
                    </div>
                    <div className="timeline-date">
                    {item.deliveredAt 
                        ? `${formatDate(item.deliveredAt)} 완료` 
                        : item.shippedAt 
                        ? `${formatDate(item.shippedAt)} 출발` 
                        : '상품 준비 중'}
                    </div>
                </div>
                
                <div className="product-name-text">{item.representativeProductName}</div>
                    <div className="total-amount-text">{item.totalAmount.toLocaleString()}원</div>
                    
                    {item.trackingNumber && (
                        <div className="tracking-number-text">운송장: {item.trackingNumber}</div>
                    )}
                </div>

                {/* 버튼 액션 영역 */}
                <div className="action-button-area">
                    <div
                      className="btn-item secondary"
                      onClick={() => navigate(ORDER_PATH() + ORDER_DETAIL_PATH(item.orderId))}
                    >
                      주문 상세
                    </div>
                    {item.trackingNumber && <div className="btn-item primary">배송 조회</div>}
                </div>
            </div>
        </div>
  );
};