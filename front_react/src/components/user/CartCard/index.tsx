import { CartItem } from "@/apis/user/response/cart/cart-item-response.dto";

interface Props {
    item: CartItem; // 장바구니 리스트에 있을 1개의 요소 
    isSelected: boolean; //선택 여부
    onToggle: (id: number) => void; //선택여부 on,off 상태
    onQuantityChange: (id: number, currentQty: number, delta: number) => void;
    //수량 변화 
    onDelete: (id: number) => void;
    //장바구니 개별삭제
}


//컴포넌트 : 장바구니 
export const CartCard = ({item, isSelected, onToggle, onQuantityChange, onDelete}: Props) => {

    const optionValues = Array.isArray(item.optionValueList) ? item.optionValueList : [];
    const safePrice = typeof item.price === 'number' ? item.price : Number(item.price) || 0;
    const safeProductName = item.productName ?? '';
    const safeThumbnailUrl = item.thumbnailUrl ?? '';

    //렌더 : 장바구니 
    return (
        <div className={`cart-card-item ${!item.isBuyable ? 'disabled' : ''}`}>
            {/* 체크박스 */}
            <div className="check-area">
                <input 
                    type="checkbox" 
                    checked={isSelected}
                    disabled={!item.isBuyable}
                    onChange={() => onToggle(item.cartItemId)}
                />
            </div>

            {/* 이미지 */}
            <div className="image-area">
                <img src={safeThumbnailUrl} alt={safeProductName} />
                {item.skuStatus === '품절' && <div className="overlay">품절</div>}
            </div>

            {/* 상품 상세 및 옵션 */}
            <div className="info-area">
                <p className="product-name">{safeProductName}</p>
                <div className="option-tags">
                    {optionValues.map((option, idx) => (
                        <span key={option.optionValueId ?? idx} className="option-tag">
                            {option.value}
                        </span>
                    ))}
                </div>
                <p className="price-text">{safePrice.toLocaleString()}원</p>
                {!item.isBuyable && <p className="reason-text">{item.buyableReason}</p>}
            </div>

            {/* 수량 및 관리 */}
            <div className="control-area">
                <div className="qty-picker">
                    <button onClick={() => onQuantityChange(item.cartItemId, item.quantity, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => onQuantityChange(item.cartItemId, item.quantity, 1)}>+</button>
                </div>
                <p className="subtotal-price">{(safePrice * item.quantity).toLocaleString()}원</p>
                <button className="delete-btn" onClick={() => onDelete(item.cartItemId)}>삭제</button>
            </div>
        </div>
    );
};