import { CartCard } from "@/components/user/CartCard";
import { useCart } from "@/hooks/user/cart/use-cart.hook";
import { useMemo } from "react";
import './stlye.css';
import { CartItem } from "@/apis/user/response/cart/cart-item-response.dto";

export const Cart = () => {

    //커스텀 훅 : 장바구니 이벤트 처리 
    const {
        selectedIds,    isAllSelected,  items,       
        //선택된 것 여부/전체선택여부   /  카트 배열 데이터 

        onToggle, onQuantityChange, deleteSelectedEventHandler, 

        //토글이벤트, 수정이벤트    , 삭제이벤트 ,               
        deleteAllEventHandler, 
        //   전체삭제 
        onToggleAll, handleOrderSubmit
        //전체 선택 여부 / 주문요청
    } = useCart();


    const totalAmount = useMemo(() => {//총값 값 계산
        const total = items.map( sum =>sum.price);
        return total;
    }, [items])

    return(
    // 메인 장바구니 페이지 예시
    <div className="cart-page-wrapper">
        {/* 왼쪽 영역 */}
        <div className="cart-left-container">
            <div className="cart-top-controls">
                <div className="all-select-group">
                    <input type="checkbox" id="all" checked={isAllSelected} onChange={onToggleAll} />
                    <label htmlFor="all">전체선택</label>
                </div>
                <div className="action-group">
                    <div className="action-btn" onClick={deleteAllEventHandler}>전체삭제</div>
                </div>
            </div>

            <div className="cart-list">
                {items?.map((item : CartItem) => ( //장바구니 개수가 궁금 => cartItemId를 쓰는게 당연
                    <CartCard 
                        key={item.cartItemId}
                        item={item}
                        isSelected={selectedIds.includes(item.cartItemId)}
                        onToggle={onToggle}
                        onQuantityChange={onQuantityChange}
                        onDelete={deleteSelectedEventHandler}
                    />
                ))}
            </div>
        </div>

        {/* 오른쪽 영역 (OrderCreateResponse 기반) */}
        <div className="cart-right-container">
            <div className="order-summary-box">
                <div className="summary-info">
                    <div className="summary-title">결제 예정 정보</div>
                </div>

                <div className="price-display">
                    <div className="price-label">총 주문금액</div>
                    <div className="price-value">{totalAmount}원</div>
                </div>

                <div className="order-submit-btn" onClick={handleOrderSubmit}>
                    주문하기
                </div>
            </div>
        </div>
    </div>
    );
}