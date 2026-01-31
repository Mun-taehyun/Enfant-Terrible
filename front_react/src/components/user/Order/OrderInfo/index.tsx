import { OrderPrepareItem } from "@/apis/user/response/order/order-prepare-response.dto";
import './style.css';

//컴포넌트 : 상품 주문 리스트 
export default function OrderInfo({
    items,
    onQuantityChange,
}: {
    items: (OrderPrepareItem & { cartItemId?: number | null; })[] | null;
    onQuantityChange?: (cartItemId: number, nextQty: number) => void;
}) {

    const safeItems = Array.isArray(items) ? items : []


    //렌더 : 상품 주문 리스트 
    return (
        <div className="order-list">
            <div className="order-list-title">주문 상품</div>

            <div className="order-list-items">
                {safeItems.length > 0 ? safeItems.map(item => ( //상품 리스트 .. 
                    <div key={item.skuId}
                        className={`order-item ${!item.isBuyable ? 'disabled' : ''}`}>

                        <div className="order-item-thumbnail"><img src={item.thumbnailUrl ?? ''} /></div>
                        <div className="order-item-info">
                            <div className="order-item-name">{item.productName ?? ''}</div>

                            {typeof item.cartItemId === 'number' && onQuantityChange ? (
                                <div className="order-item-quantity">
                                    <button
                                        onClick={() => onQuantityChange(item.cartItemId as number, (item.quantity ?? 1) - 1)}
                                        disabled={(item.quantity ?? 1) <= 1}
                                    >-
                                    </button>
                                    <span>수량 {item.quantity ?? 0}</span>
                                    <button
                                        onClick={() => onQuantityChange(item.cartItemId as number, (item.quantity ?? 0) + 1)}
                                    >+
                                    </button>
                                </div>
                            ) : (
                                <div className="order-item-quantity">수량 {item.quantity ?? 0}</div>
                            )}
                        </div>

                        <div className="order-item-price">{(((item.price ?? 0) * (item.quantity ?? 0)) as number).toLocaleString()}원</div>
                        {!item.isBuyable && (
                            <div className="order-item-warning">
                                {item.buyableReason}
                            </div>
                        )}
                    </div>
                )) :
                    <div className="empty-message"> 주문하는 상품이 없습니다. </div>
                }
            </div>
        </div>
    );
}