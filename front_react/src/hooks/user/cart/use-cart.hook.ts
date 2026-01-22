import PutCartItemRequestDto from "@/apis/user/request/cart/put-cart-item-request.dto";
import { OrderFromCartRequestDto } from "@/apis/user/request/order";
import { AUTH_LOGIN_PATH, AUTH_PATH } from "@/constant/user/route.index";
import { cartQueries, orderQueries } from "@/querys/user/queryhooks";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/use-sign.hook";

export const useCart = () => {

    //커스텀 훅 : 유저 정보 
    const {myInfo} = useAuth();

    //서버상태 : 장바구니 조회 
    const { data: cartData} = cartQueries.useGetItems();

    //서버상태 : 장바구니 추가 
    const insertMutation = cartQueries.usePostItem();

    //서버상태 : 장바구니 수량 수정
    const updateMutation = cartQueries.useUpdateItem();

    //서버상태 : 장바구니 부분삭제 
    const deleteMutation = cartQueries.useDeleteItem();

    //서버상태 : 장바구니 전체삭제
    const clearMutation = cartQueries.useClearCart();

    //서버상태 : 장바구니 주문
    const orderMutation = orderQueries.usePostOrderFromCart();

    const items = Array.isArray(cartData) ? cartData : [];

    //상태 : 선택여부 
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const buyableItems = items.filter(item => item.isBuyable); //살 수 있는 것만 골라냄 
    const buyableIds = buyableItems.map(item => item.cartItemId);//장바구니 아이템이 있을 때

    //함수 : 네비게이트 
    const navigate = useNavigate();
    
    //전체 선택 여부 
    const isAllSelected = buyableIds.length > 0 && buyableIds.every(id => selectedIds.includes(id));

    const totalOrderPrice = items
        .filter(item => selectedIds.includes(item.cartItemId))
        .reduce((sum, item) => sum + (item.price * item.quantity), 0);

    //이벤트핸들러 : 수량 수정 이벤트 처리 
    const onQuantityChange = (cartItemId: number, currentQty: number, delta: number) => {
        const nextQty = currentQty + delta;
        if (nextQty < 1) return;
        const requestBody : PutCartItemRequestDto = {quantity : nextQty};
        updateMutation.mutate({ cartItemId : cartItemId,  requestBody });
    };


    //이벤트핸들러 : 토글 on/off 
    const onToggle = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
    };

    //이벤트핸들러: 토글 전체 on/off
    const onToggleAll = () => {
        setSelectedIds(isAllSelected ? [] : buyableIds);
    };


    //이벤트핸들러 : 주문 제출 이벤트 처리 
    const handleOrderSubmit = () => {
        const token = localStorage.getItem("accessToken"); //토큰 검증
        if (!myInfo && !token) return navigate(AUTH_PATH() + "/" + AUTH_LOGIN_PATH()) ;

        // 유저 데이터에서 DTO 형식에 맞게 추출
        const requestBody: OrderFromCartRequestDto = {
            receiverName: myInfo!.name,
            receiverPhone: myInfo!.tel,
            zipCode: myInfo!.zipCode,
            addressBase: myInfo!.addressBase,
            addressDetail: myInfo ? myInfo!.addressDetail : null
        };

        orderMutation.mutate(requestBody, {
            onSuccess: (response) => {
                // response는 OrderCreateResponse 타입
                // 주문 성공 시 받은 orderId를 가지고 주문화면으로 이동
                navigate(`/order/checkout/${response.orderId}`);
            },
            onError: () => alert("주문 생성에 실패했습니다.")
        });
    };


    return {
        items,     //장바구니 데이터 전송(조회)
        selectedIds, //선택되었는 지 여부
        isAllSelected,  //전체선택 여부
        totalOrderPrice,
        onQuantityChange,   //수량 수정 여부 
        onToggle,
        onToggleAll,
        deleteSelectedEventHandler: (id: number) => deleteMutation.mutate(id),
        deleteAllEventHandler: () => clearMutation.mutate(),
        handleOrderSubmit, //내 정보를 넘긴 후 결제 페이지로 이동
        insertMutation //추가하는 데이터 => 상품 훅에서 사용할 예정 
    };
};