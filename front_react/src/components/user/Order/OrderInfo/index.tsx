import { OrderPrepareItem } from "@/apis/user/response/order/order-prepare-response.dto";


//컴포넌트 : 상품 주문 리스트 
export default function OrderInfo({ items }: { items: OrderPrepareItem[] }) {

    //렌더 : 상품 주문 리스트 
    return (
        <div className="order-list">
            <div className="order-list-title">주문 상품</div>

            <div className="order-list-items">
                {items.map(item => ( //상품 리스트 .. 
                    <div key={item.skuId}
                        className={`order-item ${!item.isBuyable ? 'disabled' : ''}`}>
                        <div className="order-item-thumbnail"><img src={item.thumbnailUrl} /></div>
                        <div className="order-item-info">
                            <div className="order-item-name">{item.productName}</div>
                            <div className="order-item-quantity">수량 {item.quantity}</div>
                        </div>
                        <div className="order-item-price">{(item.price * item.quantity).toLocaleString()}원</div>
                        {!item.isBuyable && (
                            <div className="order-item-warning">
                                {item.buyableReason}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}