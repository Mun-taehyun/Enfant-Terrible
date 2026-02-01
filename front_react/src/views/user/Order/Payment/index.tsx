import OrderInfo from "@/components/user/Order/OrderInfo";
import OrderLast from "@/components/user/Order/OrderLast";
import OrderUser from "@/components/user/Order/OrderUser";
import PaymentMethodSelector from "@/components/user/PaymentSelector";
import { useProduct } from "@/hooks/user/product/use-product.hook";
import { cartQueries, orderQueries, pointQueries } from "@/querys/user/queryhooks";
import { useEffect, useMemo, useState } from "react";
import "@/components/user/Order/OrderLast/style.css";


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

    //서버상태 : 포인트조회
    const { data: pointData } = pointQueries.useBalance();

    const pointBalance = useMemo(() => {
        const v = (pointData as any)?.balance;
        return typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;
    }, [pointData]);

    const orderTotal = useMemo(() => {
        const v = isDirect ? (directData ? directData.totalAmount : null) : (cartData ? cartData.totalAmount : null);
        return v != null && Number.isFinite(v) ? Math.floor(v) : 0;
    }, [isDirect, directData, cartData]);

    const maxUsablePoint = useMemo(() => {
        return Math.max(0, Math.min(pointBalance, orderTotal));
    }, [pointBalance, orderTotal]);

    const [usedPointInput, setUsedPointInput] = useState<string>('0');

    const usedPoint = useMemo(() => {
        const n = Number(usedPointInput);
        if (!Number.isFinite(n)) return 0;
        return Math.max(0, Math.min(Math.floor(n), maxUsablePoint));
    }, [usedPointInput, maxUsablePoint]);

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

            <div className="point-use-container">
                <div className="point-use-header">
                    <span className="point-use-label">보유 포인트</span>
                    <span className="point-use-balance">{pointBalance.toLocaleString()}P</span>
                </div>

                <div className="point-use-controls">
                    <input
                        className="point-use-input"
                        inputMode="numeric"
                        placeholder="0"
                        value={usedPointInput}
                        onChange={(e) => {
                            const next = e.target.value;
                            if (next === '') {
                                setUsedPointInput('');
                                return;
                            }
                            if (!/^\d+$/.test(next)) return;
                            setUsedPointInput(next);
                        }}
                        onBlur={() => {
                            setUsedPointInput(String(usedPoint));
                        }}
                    />
                    <button
                        type="button"
                        className="point-use-all"
                        onClick={() => setUsedPointInput(String(maxUsablePoint))}
                        disabled={maxUsablePoint <= 0}
                    >
                        전체사용
                    </button>
                </div>

                <div className="point-use-summary">
                    <span className="point-use-summary-label">사용 포인트</span>
                    <span className="point-use-summary-value">-{usedPoint.toLocaleString()}원</span>
                </div>
            </div>
            <PaymentMethodSelector selected={paymentMethod} onChange={setPaymentMethod}/>

            <OrderLast
                totalAmount={isDirect ? (directData ? directData.totalAmount : null) : (cartData ? cartData.totalAmount: null)}
                paymentMethod={paymentMethod}
                isBuyable={isBuyableAll}
                mode={isDirect ? 'direct' : 'cart'}
                usedPoint={usedPoint}
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