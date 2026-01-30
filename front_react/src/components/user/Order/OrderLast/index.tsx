import { useAuth } from "@/hooks/user/auth/use-sign.hook";
import { useProduct } from "@/hooks/user/product/use-product.hook";
import { orderQueries, paymentQueries, pointQueries } from "@/querys/user/queryhooks";

// 1. 상세 타입 정의 (any 대신 사용)
interface IamportResponse {
  success: boolean;
  error_msg?: string;
  imp_uid?: string;
  merchant_uid?: string;
  paid_amount?: number;
}

interface IamportRequest {
  channelKey?: string;
  merchant_uid: string;
  name: string;
  amount: number;
  buyer_email?: string;
  buyer_name?: string;
  buyer_tel?: string;
}

interface Iamport {
  init: (merchantId: string) => void;
  request_pay: (
    data: IamportRequest,
    callback: (rsp: IamportResponse) => void
  ) => void;
}

// 2. Window 객체 확장
declare global {
  interface Window {
    IMP: Iamport;
  }
}

interface OrderLastProps {
  totalAmount : number | null,
  paymentMethod: string,
  isBuyable: boolean | null,
}




export default function OrderLast({
  totalAmount,
  paymentMethod,
  isBuyable
}: OrderLastProps) {
  
  //커스텀 훅 : 유저 
  const { myInfo } = useAuth();
  //커스텀 훅 : 상품
  const { searchParams } = useProduct();

  //서버상태 : 포인트조회
  const {data: pointData} = pointQueries.useBalance();

  //서버상태 : 결제
  const { mutate : paymentMutate, isPending } = paymentQueries.usePostPaymentConfirm();

  const params = {
    productId: Number(searchParams.get("productId")),  
    optionValueIds: searchParams.getAll("optionValueIds").map(Number),
    quantity: Number(searchParams.get("quantity")) || 1 
  }

  //서버상태 : 즉시 주문 준비
  const {data : directInfo} = orderQueries.useGetOrderPrepareDirect(params);
  const item = directInfo?.items?.[0];


  //서버상태 : 장바구니 주문생성 
  const { mutate : cartData } = orderQueries.usePostOrderFromCart();
  //서버상태 : 즉시 주문생성 
  const { mutate : directData } = orderQueries.usePostOrderDirect();



  const handlePayment = () => {
    if (!paymentMethod) return alert('결제 수단을 선택하세요');
    if (!isBuyable) return alert('구매 불가 상품이 포함되어 있습니다');
    if (isPending || !myInfo || !pointData || !item) return;


    if (cartData) {
      cartData(  
        {
          receiverName : myInfo?.name,
          receiverPhone : myInfo?.tel,
          zipCode: myInfo?.zipCode,
          addressBase: myInfo?.addressBase,
          addressDetail: myInfo?.addressDetail,
          usedPoint: pointData?.balance
        },
        {
        onSuccess: ({ orderCode, totalAmount }) => {
          paymentEventHandler(orderCode, totalAmount);
        },
        }
      );
    } else {
      directData(
        {
          productId : item.productId,
          optionValueIds : item.optionValueIds.map((id:number) => ({optionValueId: id , value: ""})) ,
          quantity : item.quantity,
          receiverName : myInfo?.name,
          receiverPhone : myInfo?.tel,
          zipCode: myInfo?.zipCode,
          addressBase: myInfo?.addressBase,
          addressDetail: myInfo?.addressDetail,
          usedPoint: pointData?.balance
        }, 
        {
        onSuccess: ({ orderCode, totalAmount }) => {
          paymentEventHandler(orderCode, totalAmount);
        },
      });
    }
  };
  
  const paymentEventHandler = (orderCode: string, totalAmount:number) => {
    const { IMP } = window;
    if (!IMP) return alert("결제 모듈 로드 실패");

    IMP.init("imp12345678"); // 가맹점 식별코드

    const paymentData: IamportRequest = {
      channelKey: "channel-key-f14164d3-e4ed-4429-a50c-459dca5ad0dc",
      merchant_uid: orderCode, 
      name: "테스트 상품",
      amount: totalAmount,
      buyer_name: "홍길동",
      buyer_email: "test@test.com",
    };

    IMP.request_pay(paymentData, (response) => {
      if (response.success && response.imp_uid && response.merchant_uid && response.paid_amount) {
        paymentMutate({
          paymentId: response.imp_uid,
          orderCode: response.merchant_uid,
          amount: response.paid_amount,
        });
      } else {
        alert(`결제 실패: ${response.error_msg}`);
      }
    });
  };

  return (
    <div className="order-submit-bar">
      <div className="total-amount-container">
        <span className="total-label">총 결제 금액</span>
        <span className="total-value">{totalAmount ? totalAmount.toLocaleString() : 0 }원</span>
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
