import { usePopupControl } from "@/hooks/user/popup/use-popup-controller";
import type {PopupItem} from "@/types/user/interface";
// import dayjs, { Dayjs } from "dayjs";
import { createPortal } from "react-dom";
import './style.css';


interface Prop {
    popupItem : PopupItem;
}



export default function Popup( {popupItem} : Prop) {

const { title, content, linkUrl, imageUrl, width, height, position } = popupItem;
    const { isPopup, popupCloseTime } = usePopupControl();

    const positionClass = (position ? String(position) : "center")
        .toLowerCase()
        .replaceAll("_", "-");

    const PopupLinkEventHandler = () => {
        if (linkUrl) window.open(linkUrl, "_blank");
    };

    if (!isPopup) return null;

    // 이미지 경로에 서버 주소가 없다면 `${process.env.REACT_APP_API_URL}${imageUrl}` 형태로 수정 필요
    const fullImageUrl = imageUrl && imageUrl.startsWith('http') 
        ? imageUrl 
        : imageUrl 
            ? `http://localhost:8080${imageUrl}` 
            : ""; // 이미지가 아예 없으면 빈 문자열 처리

    return createPortal(
        <div className={`popup-overlay ${positionClass}`}>
            <div className="popup-wrapper" style={{ width: `${width}px` }}>
                {/* 헤더: 제목 */}
                <div className="popup-header">
                    <h3>{title}</h3>
                    <button className="close-x" onClick={() => popupCloseTime(0)}>✕</button>
                </div>

                {/* 바디: 이미지 & 내용 */}
                <div className="popup-body" onClick={PopupLinkEventHandler} style={{ cursor: 'pointer' }}>
                    <img src={fullImageUrl} alt={title} style={{ height: `${height}px` }} />
                    {content && <div className="popup-text-content">{content}</div>}
                </div>

                {/* 푸터: 닫기 버튼 */}
                <div className="popup-footer">
                    <button className="btn-time-close" onClick={() => popupCloseTime(1440)}>
                        하루 동안 보지 않기
                    </button>
                    <button className="btn-close" onClick={() => popupCloseTime(0)}>닫기</button>
                </div>
            </div>
        </div>,
        document.body
    );
}


// 팝업처럼 떠있는 UI 는 createPortal을 이용 .. 
// createPortal(children, container) 인데 
// 1번째 매개변수 children : 렌더링할 React 요소 (리턴되는 물리DOM)
// 2번째 매개변수 container : 실제 DOM에 붙을 위치 



// 로컬 스토리지 기본 사용법 
// 저장 : localStorage.setItem(key, value);
// 조회 : localStorage.getItem(key);
// 삭제 : localStorage.removeItem(key);
// 전체삭제 : localStorage.clear(); => 쓸일 없음 . 


//window.open() 함수.. ==> 반드시 클릭으로 호출 
// open(url, target) 2가지 매개 변수만 알아도 된다. 

// 2번째 매개변수 target 

// _blank : 새 창 
// _self : 현재 탭
// _parent : 부모프레임 
// _top : 최상위프레임 
// windowName : 같은이름 시 기존 창 재사용 

