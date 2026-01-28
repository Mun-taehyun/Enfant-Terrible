import { popupStorage } from "@/utils/user/popup/popup-storage";
import { useState } from "react";

//커스텀 훅 : 팝업시스템 생명주기 함수 반환
export const usePopupControl = () => {
  const [isPopup, setIsPopup] = useState(() => {
    if (typeof window === 'undefined') return false;
    //윈도우 객체가 존재하지 않으면 DOM참조를 못한 채로 팝업 실행 => 불완전.. 
    return popupStorage.isExpired();
  }); //키자마자 Popup on / off => 즉시 isPopup으로 반영 (이거로 활용.. )

  const popupCloseTime = (minutes:number) => {
    popupStorage.setExpiry(minutes);
    //설정된 minutes에 따라 => 현재시간 + 분으로 만료시간 반환
    setIsPopup(false);
  }; //팝업 바인딩 => off상태 

  return { isPopup, popupCloseTime };
  //이걸 Popup컴포넌트에 사용한다 => 반환 변수/함수 
};