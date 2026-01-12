import { usePopupControl } from "@/hooks/user/popup/use-popup-controller";
import type {PopupItem} from "@/types/user/interface";
// import dayjs, { Dayjs } from "dayjs";
import { createPortal } from "react-dom";


interface Prop {
    popupItem : PopupItem;
}



export default function Popup( {popupItem} : Prop) {

    //속성 : 인터페이스 "하나의 객체만 생각 => 이미 App.tsx에서 걸러짐"
    const {title, content, linkUrl , fileUrl} = popupItem;//구 .분 .할

    //상태 : 팝업창을 닫는 상태변수 (접속 시 10분정도 / 재접속 시 뜸 ) => 사용자 관리
    const {isPopup, popupCloseTime} = usePopupControl();
        //팝업on/off 여부,  //팝업닫는시간 여부


    //이벤트핸들러 : 광고 팝업 클릭 시 해당 링크로 이동하는 이벤트 처리
    const PopupLinkEventHandler = () => {
        window.open(linkUrl, "_blank")
    }//광고 사이트로 새창을 띄운다.. 





    if (!isPopup) return null;
    return createPortal(
        <div id="popup-container">
            <div className="popup-title-box">{title}</div>
            <div className="popup-content-box">{content}</div>
            <div className="popup-image-box">
                <img src={fileUrl} style={{cursor: 'pointer'}} onClick={PopupLinkEventHandler}/>
                <button onClick={() => popupCloseTime(10)}>
                    10분 동안 닫기
                </button>
            </div>
        </div>,
        document.body
        //창의 어디에나 들어올 수 있게.. 
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

