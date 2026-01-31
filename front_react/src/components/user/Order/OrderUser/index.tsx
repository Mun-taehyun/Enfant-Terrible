import './style.css';

export default function OrderUser({
    receiverName,
    receiverPhone,
    zipCode,
    addressBase,
    addressDetail,
    onChangeReceiverName,
    onChangeReceiverPhone,
    onChangeZipCode,
    onChangeAddressBase,
    onChangeAddressDetail,
}: {
    receiverName: string;
    receiverPhone: string;
    zipCode: string;
    addressBase: string;
    addressDetail: string;
    onChangeReceiverName: (v: string) => void;
    onChangeReceiverPhone: (v: string) => void;
    onChangeZipCode: (v: string) => void;
    onChangeAddressBase: (v: string) => void;
    onChangeAddressDetail: (v: string) => void;
}) {

    //렌더 : 배송지
    return (
        <div className="order-receiver">
            <div className="order-section-title">배송 정보</div>

            <div className="receiver-row">
                <div className="label">수령인</div>
                <div className="value">
                    <input value={receiverName} onChange={(e) => onChangeReceiverName(e.target.value)} />
                </div>
            </div>

            <div className="receiver-row">
                <div className="label">연락처</div>
                <div className="value">
                    <input value={receiverPhone} onChange={(e) => onChangeReceiverPhone(e.target.value)} />
                </div>
            </div>

            <div className="receiver-row">
                <div className="label">우편번호</div>
                <div className="value">
                    <input value={zipCode} onChange={(e) => onChangeZipCode(e.target.value)} />
                </div>
            </div>

            <div className="receiver-row">
                <div className="label">기본주소</div>
                <div className="value">
                    <input value={addressBase} onChange={(e) => onChangeAddressBase(e.target.value)} />
                </div>
            </div>

            <div className="receiver-row">
                <div className="label">상세주소</div>
                <div className="value">
                    <input value={addressDetail} onChange={(e) => onChangeAddressDetail(e.target.value)} />
                </div>
            </div>
        </div>
    );
}