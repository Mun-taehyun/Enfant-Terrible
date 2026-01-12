//팝업에서 쓰이는 조건이 걸린 함수 모음 


//함수 : 광고팝업의 시간포맷 저장 .. => 만료시간.. 
export const popupStorage = {
    setExpiry: (minutes : number) => {
        const expireTime = new Date().getTime() + minutes * 60 * 1000;
        //기존시간 60초 x 분 (커스텀 가능으로 둘 지 고민..) => 만료 시간 몇분으로 측정... 
        localStorage.setItem("popup-bind", expireTime.toString());
        //스토리지에 보관 => 도출.. 
    },
    
    isExpired: () => {
        const expiryTime = localStorage.getItem("popup-bind");
        //만료시간을 가져온다.. 
        if (!expiryTime) return true; 
        return new Date().getTime() > parseInt(expiryTime);
        //현재시간 > 만료시간 => 이후 시간이면 다시 popup오픈... 
    }
}; 