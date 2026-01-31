import OrderInfo from "@/components/user/Order/OrderInfo";
import OrderLast from "@/components/user/Order/OrderLast";
import OrderUser from "@/components/user/Order/OrderUser";
import PaymentMethodSelector from "@/components/user/PaymentSelector";
import { useProduct } from "@/hooks/user/product/use-product.hook";
import { cartQueries, orderQueries } from "@/querys/user/queryhooks";
import { useEffect, useMemo, useState } from "react";


//컴포넌트 : 결제페이지 
export default function OrderPreparePage() {

    //커스텀 훅 : 쿼리스트링 
    const {searchParams} = useProduct();

    const optionValueIdsRaw = searchParams.getAll("optionValueIds").map(item => Number(item)).filter((v) => Number.isFinite(v));
    const params = {
        productId : Number(searchParams.get("productId")),
        optionValueIds : optionValueIdsRaw.length > 0 ? optionValueIdsRaw : null,
        quantity : Number.isFinite(Number(searchParams.get("quantity"))) && Number(searchParams.get("quantity")) > 0 ? Number(searchParams.get("quantity")) : 1
    }

    const isDirect = Number.isFinite(params.productId) && params.productId > 0;

    //서버상태 : 카드 주문준비페이지 이동 
    const { data: cartData } = orderQueries.useGetOrderPrepareFromCart();
    //서버상태 : 즉시 주문페이지 이동 
    const { data: directData} = orderQueries.useGetOrderPrepareDirect(params);

    //서버상태 : 장바구니 아이템(수량 수정용)
    const { data: cartItemsData } = cartQueries.useGetItems();
    const updateCartItemMutation = cartQueries.useUpdateItem();

    //상태: 결제방식 선택 
    const [paymentMethod, setPaymentMethod] = useState<string>('');

    const order = isDirect ? (directData ? directData : null) : (cartData ? cartData : null);
    const items = isDirect ? (directData?.items ?? null) : (cartData?.items ?? null);

    const safeItems = Array.isArray(items) ? items : [];
    const isBuyableAll = safeItems.length > 0 ? safeItems.every(item => item?.isBuyable) : null;

    const [receiverName, setReceiverName] = useState<string>('');
    const [receiverPhone, setReceiverPhone] = useState<string>('');
    const [zipCode, setZipCode] = useState<string>('');
    const [addressBase, setAddressBase] = useState<string>('');
    const [addressDetail, setAddressDetail] = useState<string>('');

    useEffect(() => {
        if (!order) return;
        setReceiverName(order.receiverName ?? '');
        setReceiverPhone(order.receiverPhone ?? '');
        setZipCode(order.zipCode ?? '');
        setAddressBase(order.addressBase ?? '');
        setAddressDetail(order.addressDetail ?? '');
    }, [order?.userId]);

    const cartItemList = Array.isArray(cartItemsData?.cartList) ? cartItemsData!.cartList : [];
    const cartItemBySkuId = useMemo(() => {
        const m = new Map<number, any>();
        for (const it of cartItemList) {
            if (typeof it?.skuId === 'number') m.set(it.skuId, it);
        }
        return m;
    }, [cartItemList]);

    const editableItems = useMemo(() => {
        if (!isDirect) {
            return safeItems.map((it: any) => {
                const cartIt = cartItemBySkuId.get(it?.skuId);
                const cartItemId = typeof cartIt?.cartItemId === 'number' ? cartIt.cartItemId : null;
                const quantity = typeof cartIt?.quantity === 'number' ? cartIt.quantity : it?.quantity;
                return {
                    ...it,
                    cartItemId,
                    quantity,
                };
            });
        }

        return safeItems;
    }, [safeItems, isDirect, cartItemBySkuId]);

    return (
        <div className="order-prepare-page">
            <OrderUser
                receiverName={receiverName}
                receiverPhone={receiverPhone}
                zipCode={zipCode}
                addressBase={addressBase}
                addressDetail={addressDetail}
                onChangeReceiverName={setReceiverName}
                onChangeReceiverPhone={setReceiverPhone}
                onChangeZipCode={setZipCode}
                onChangeAddressBase={setAddressBase}
                onChangeAddressDetail={setAddressDetail}
            />
            <OrderInfo
                items={editableItems as any}
                onQuantityChange={
                    isDirect
                        ? undefined
                        : (cartItemId: number, nextQty: number) => {
                            if (!Number.isFinite(nextQty) || nextQty < 1) return;
                            updateCartItemMutation.mutate({ cartItemId, requestBody: { quantity: nextQty } });
                        }
                }
            />
            <PaymentMethodSelector selected={paymentMethod} onChange={setPaymentMethod}/>

            <OrderLast
                totalAmount={isDirect ? (directData ? directData.totalAmount : null) : (cartData ? cartData.totalAmount: null)}
                paymentMethod={paymentMethod}
                isBuyable={isBuyableAll}
                mode={isDirect ? 'direct' : 'cart'}
                shipping={
                    {
                        receiverName,
                        receiverPhone,
                        zipCode,
                        addressBase,
                        addressDetail: addressDetail ? addressDetail : null,
                    }
                }
                directParams={
                    isDirect
                        ? {
                            productId: params.productId,
                            optionValueIds: Array.isArray(params.optionValueIds) ? params.optionValueIds : [],
                            quantity: Number.isFinite(params.quantity) && params.quantity > 0 ? params.quantity : 1,
                        }
                        : null
                }
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