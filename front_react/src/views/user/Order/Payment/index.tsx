import OrderInfo from "@/components/user/Order/OrderInfo";
import OrderLast from "@/components/user/Order/OrderLast";
import OrderUser from "@/components/user/Order/OrderUser";
import PaymentMethodSelector from "@/components/user/PaymentSelector";
import { useProduct } from "@/hooks/user/product/use-product.hook";
import { orderQueries } from "@/querys/user/queryhooks";
import { useState } from "react";


//컴포넌트 : 결제페이지 
export default function OrderPreparePage() {

    //커스텀 훅 : 쿼리스트링 
    const {searchParams} = useProduct();

    const params = {
        productId : Number(searchParams.get("productId")),
        optionValueIds : searchParams.getAll("optionValueIds").map(item => Number(item)) || null, //여러개 or null
        quantity : Number(searchParams.get("quantity"))
    }

    //서버상태 : 카드 주문준비페이지 이동 
    const { data: cartData } = orderQueries.useGetOrderPrepareFromCart();
    //서버상태 : 즉시 주문페이지 이동 
    const { data: directData} = orderQueries.useGetOrderPrepareDirect(params);

    //상태: 결제방식 선택 
    const [paymentMethod, setPaymentMethod] = useState<string>('');


    
    return (
        <div className="order-prepare-page">
            <OrderUser order={(cartData ? cartData : null) || (directData ? directData : null)} />
            <OrderInfo items={(cartData ? cartData.items : null) || (directData ? directData.items : null)} />
            <PaymentMethodSelector selected={paymentMethod} onChange={setPaymentMethod}/>

            <OrderLast
                totalAmount={(cartData ? cartData.totalAmount: null) || (directData ? directData.totalAmount : null)}
                paymentMethod={paymentMethod}
                isBuyable={(cartData ? cartData.items.every(item => item.isBuyable) : null) || (directData ? directData.items.every(item => item.isBuyable) : null)}
            />
        </div>
    );
}


//   CARD,      //카드 
//   NAVERPAY,  //네이버페이
//   KAKAOPAY,  //카카오페이
//   TOSSPAY,   //토스페이
//   TRANSFER,  //계좌이체 
//   VIRTUAL_ACCOUNT, //가상계좌
//   MOBILE;    //휴대폰소액결제