import type {PopupListItem} from "@/types/user/interface";
import dayjs from "dayjs";
import { useState } from "react";
import { createPortal } from "react-dom";


interface Prop {
    popupList : PopupListItem;
}



export default function Popup( {popupList} : Prop) {

    //속성 : 인터페이스 
    const {popupId, title, content, linkUrl , fileUrl , isActive , endAt} = popupList;

    //상태 : 팝업창을 닫는 상태변수 (접속 시 10분정도 / 재접속 시 뜸 ) => 사용자 관리
    const [popup, setPopup] = useState<boolean>(true);



    //이벤트핸들러 : 팝업 닫기 시 팝업이 뜨지 않도록 .. but 10분정도 안뜨게 둔다 가정... 
    const closePopupEventHandler = (popupId : number | string) => {
        if(!isActive && !popup) return; //팝업창이 뜬 것부터 이상현상 return
        
        //닫고 그 당시의 시간 체크 => 정보 저장용 localStorage 도입
        setPopup(false);
        

        let ddd = 600;
        const now = dayjs().add(9, 'hour');
        //현재(미국)시간 객체 dayjs()를 한국시간으로 보정
        const writeTime = dayjs(now);
        //dayjs 객체로 변환 => "현재 한국시간을 대입"
        if ()
        
        setPopup(true);

        
    }

    const PopupLinkEventHandler = () => {
        window.open(linkUrl, "_blank")
    }//광고 사이트로 새창을 띄운다.. 


    if (!popup && !popupId && !isActive) return null;
    return createPortal(
        <div id="popup-container">
            <div className="popup-title-box">{title}</div>
            <div className="popup-content-box">{content}</div>
            <div className="popup-image-box">
                <img src={fileUrl} style={{cursor: 'pointer'}} onClick={PopupLinkEventHandler}/>
                <button onClick={() => closePopupEventHandler(popupId)}>
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

