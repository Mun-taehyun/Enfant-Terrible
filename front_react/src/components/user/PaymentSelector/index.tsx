import { PAYMENT_METHOD_OPTIONS } from "@/constant/user/payment.index";



//컴포넌트 : 결제선택 
export default function PaymentMethodSelector({selected,onChange} : { selected: string; onChange: (value: string) => void;}) {

    //렌더 : 결제선택 
    return (
        <div className="payment-method">
            <div className="payment-title">결제 수단</div>
            <div className="payment-method-list">
                {PAYMENT_METHOD_OPTIONS.map(option => (
                    <div key={option.value} className={`payment-method-item ${
                        selected === option.value ? 'active' : ''}`} 
                        onClick={() => onChange(option.value)}
                    >{option.label}</div>
                ))}
            </div>
        </div>
    );
}