export default interface PopupItem {
    popupId : number;         //광고 팝업 번호
    title : string;           //광고 팝업 제목 
    content : string | null;  //광고 팝업 글
    linkUrl : string;         //광고 팝업 이미지 클릭시 링크 
    fileUrl : string;         //이미지 변수 
    isActive : boolean;       //팝업 띄우는 여부 true시에만 띄워져야함 
    endAt : string;           //  팝업 닫는 시간 날짜 객체도 string으로 받음 
}

//광고 컴포넌트에 기본적으로 넣을 객체 

