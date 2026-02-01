import { useAuth } from "@/hooks/user/auth/use-sign.hook";
import { orderQueries, paymentQueries } from "@/querys/user/queryhooks";
import { ORDER_COMPLETE_PATH, ORDER_PATH } from "@/constant/user/route.index";
import * as PortOne from "@portone/browser-sdk/v2";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import './style.css';

interface OrderLastProps {
  totalAmount : number | null,
  paymentMethod: string,
  isBuyable: boolean | null,
  mode: 'cart' | 'direct',
  usedPoint: number,
  shipping: {
    receiverName: string;
    receiverPhone: string;
    zipCode: string;
    addressBase: string;
    addressDetail: string | null;
  },
  directParams?: {
    productId: number;
    optionValueIds: number[];
    quantity: number;
  } | null,
}




export default function OrderLast({
  totalAmount,
  paymentMethod,
  isBuyable,
  mode,
  usedPoint,
  shipping,
  directParams
}: OrderLastProps) {
  
  //커스텀 훅 : 유저 
  const { myInfo } = useAuth();

  const navigate = useNavigate();

  const orderTotal = useMemo(() => {
    return totalAmount != null && Number.isFinite(totalAmount) ? Math.floor(totalAmount) : 0;
  }, [totalAmount]);

  const safeUsedPoint = useMemo(() => {
    const n = Number(usedPoint);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(Math.floor(n), orderTotal));
  }, [usedPoint, orderTotal]);

  const payableAmount = useMemo(() => {
    return Math.max(0, orderTotal - safeUsedPoint);
  }, [orderTotal, safeUsedPoint]);

  //서버상태 : 결제
  const { mutate : paymentMutate, isPending } = paymentQueries.usePostPaymentConfirm();


  //서버상태 : 장바구니 주문생성 
  const { mutate: createOrderFromCart } = orderQueries.usePostOrderFromCart();
  //서버상태 : 즉시 주문생성 
  const { mutate: createOrderDirect } = orderQueries.usePostOrderDirect();

  const envAny = import.meta.env as any;
  const storeId = (envAny.VITE_PORTONE_STORE_ID ?? '') as string;
  const channelKey = (envAny.VITE_PORTONE_CHANNEL_KEY ?? '') as string;
  const enableMockPayment = String(envAny.VITE_ENABLE_MOCK_PAYMENT ?? '').toLowerCase() === 'true';

  const uuid = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const shortId = (length: number) => {
    const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const bytes = new Uint8Array(Math.max(1, length));
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
    }
    let out = '';
    for (let i = 0; i < length; i += 1) out += alphabet[bytes[i] % alphabet.length];
    return out;
  };

  const toPortOnePayRequestExtras = (method: string): { payMethod: any; union?: Record<string, any> } => {
    const m = (method ?? '').toUpperCase();

    switch (m) {
      case 'NAVERPAY':
        return {
          payMethod: (PortOne as any).PaymentPayMethod.EASY_PAY,
          union: { easyPay: { easyPayProvider: (PortOne as any).EasyPayProvider.NAVERPAY } },
        };
      case 'KAKAOPAY':
        return {
          payMethod: (PortOne as any).PaymentPayMethod.EASY_PAY,
          union: { easyPay: { easyPayProvider: (PortOne as any).EasyPayProvider.KAKAOPAY } },
        };
      case 'TOSSPAY':
        return {
          payMethod: (PortOne as any).PaymentPayMethod.EASY_PAY,
          union: { easyPay: { easyPayProvider: (PortOne as any).EasyPayProvider.TOSSPAY } },
        };

      case 'TRANSFER':
        return { payMethod: (PortOne as any).PaymentPayMethod.TRANSFER };
      case 'VIRTUAL_ACCOUNT':
        return { payMethod: (PortOne as any).PaymentPayMethod.VIRTUAL_ACCOUNT };
      case 'MOBILE':
        return { payMethod: (PortOne as any).PaymentPayMethod.MOBILE };

      case 'CARD':
      default:
        return { payMethod: (PortOne as any).PaymentPayMethod.CARD };
    }
  };



  const handlePayment = () => {
    if (!paymentMethod) return alert('결제 수단을 선택하세요');
    if (!isBuyable) return alert('구매 불가 상품이 포함되어 있습니다');
    if (isPending || !myInfo) return;
    if (totalAmount == null || !Number.isFinite(totalAmount) || totalAmount <= 0) {
      return alert('결제 금액이 올바르지 않습니다');
    }

    if (!shipping.receiverName || !shipping.receiverPhone || !shipping.zipCode || !shipping.addressBase) {
      return alert('배송 정보가 올바르지 않습니다');
    }

    // 결제 실패 시 주문이 생성되지 않도록, 결제(성공) -> 주문생성 -> 결제승인 순서로 진행
    const orderCode = `ORD-${shortId(20)}`;
    const paymentId = `pay_${shortId(24)}`;

    const onPaid = (paidPaymentId: string) => {
      const basePayload = {
        orderCode,
        receiverName: shipping.receiverName,
        receiverPhone: shipping.receiverPhone,
        zipCode: shipping.zipCode,
        addressBase: shipping.addressBase,
        addressDetail: shipping.addressDetail ?? null,
        usedPoint: safeUsedPoint,
      };

      const confirmPayment = (confirmedOrderCode?: string, confirmedAmount?: number) => {
        paymentMutate(
          {
            paymentId: paidPaymentId,
            orderId: confirmedOrderCode ?? orderCode,
            amount: confirmedAmount ?? payableAmount,
          },
          {
            onSuccess: () => {
              navigate(ORDER_PATH() + ORDER_COMPLETE_PATH(), {
                replace: true,
                state: { orderId: confirmedOrderCode ?? orderCode },
              });
            },
            onError: (e: any) => {
              alert(e?.message ?? '결제 승인에 실패했습니다.');
            },
          }
        );
      };

      if (mode === 'cart') {
        createOrderFromCart(basePayload as any, {
          onSuccess: (res: any) => {
            confirmPayment(res?.orderCode ?? orderCode, res?.totalAmount ?? payableAmount);
          },
          onError: () => alert('주문 생성에 실패했습니다.'),
        });
        return;
      }

      if (!directParams || !directParams.productId) {
        alert('즉시구매 정보가 올바르지 않습니다');
        return;
      }

      createOrderDirect(
        {
          ...(basePayload as any),
          productId: directParams.productId,
          optionValueIds:
            Array.isArray(directParams.optionValueIds) && directParams.optionValueIds.length > 0
              ? directParams.optionValueIds
              : null,
          quantity: directParams.quantity,
        },
        {
          onSuccess: (res: any) => {
            confirmPayment(res?.orderCode ?? orderCode, res?.totalAmount ?? payableAmount);
          },
          onError: () => alert('주문 생성에 실패했습니다.'),
        }
      );
    };

    if (enableMockPayment) {
      onPaid(`payment-mock-${uuid()}`);
      return;
    }

    if (payableAmount <= 0) {
      onPaid(`payment-point-${uuid()}`);
      return;
    }

    if (!storeId || !channelKey) {
      alert('PortOne 결제 설정(storeId/channelKey)이 없습니다. (환경변수 확인 필요)');
      return;
    }

    (async () => {
      try {
        const { payMethod, union } = toPortOnePayRequestExtras(paymentMethod);

        const response = await PortOne.requestPayment({
          storeId,
          channelKey,
          paymentId,
          orderName: "주문 결제",
          totalAmount: payableAmount,
          currency: "KRW" as any,
          payMethod,
          customer: {
            fullName: shipping.receiverName,
            phoneNumber: shipping.receiverPhone,
            email: "test@test.com",
          },
          ...(union ?? {}),
        } as any);

        if (!response) {
          alert('결제가 취소되었습니다.');
          return;
        }

        if ((response as any)?.code !== undefined) {
          alert(`결제 실패: ${(response as any)?.message ?? '결제에 실패했습니다.'}`);
          return;
        }

        onPaid(paymentId);
      } catch (e: any) {
        alert(`결제 실패: ${e?.message ?? '결제에 실패했습니다.'}`);
      }
    })();
  };

  return (
    <div className="order-submit-bar">
      <div className="total-amount-container">
        <span className="total-label">총 결제 금액</span>
        <span className="total-value">{payableAmount ? payableAmount.toLocaleString() : 0 }원</span>
      </div>

      <button
        className={`submit-button ${
          !paymentMethod || !isBuyable || isPending ? 'disabled' : ''
        }`}
        onClick={handlePayment}
        disabled={!paymentMethod || !isBuyable || isPending}
      >
        {isPending ? (
          <span className="loading-text">결제 승인 중...</span>
        ) : (
          "결제하기"
        )}
      </button>
    </div>
  );
}
