import { OrderPrepareResponseDto } from "@/apis/user/response/order";

//컴포넌트 : 배송지 정보 
export default function OrderUser({order}: {order: OrderPrepareResponseDto}) {

    //렌더 : 배송지
    return (
        <div className="order-receiver">
            <div className="order-section-title">배송 정보</div>

            <div className="receiver-row">
                <div className="label">수령인</div>
                <div className="value">{order.receiverName}</div>
            </div>

            <div className="receiver-row">
                <div className="label">연락처</div>
                <div className="value">{order.receiverPhone}</div>
            </div>

            <div className="receiver-row">
                <div className="label">주소</div>
                <div className="value">
                    ({order.zipCode}) {order.addressBase}
                    {order.addressDetail && ` ${order.addressDetail}`}
                </div>
            </div>
        </div>
    );
}