import { MAIN_PATH } from "@/constant/user/route.index";
import { useLocation, useNavigate } from "react-router-dom";
import "./style.css";

export default function OrderCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const orderId = (location.state as any)?.orderId;

  return (
    <div className="order-complete-page">
      <div className="order-complete-box">
        <div className="order-complete-title">주문이 완료되었습니다</div>
        {orderId ? (
          <div className="order-complete-orderid">주문번호: {String(orderId)}</div>
        ) : null}
        <button
          type="button"
          className="order-complete-main-button"
          onClick={() => navigate(MAIN_PATH(), { replace: true })}
        >
          메인으로
        </button>
      </div>
    </div>
  );
}
