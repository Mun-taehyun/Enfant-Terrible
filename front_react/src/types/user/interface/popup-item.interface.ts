export default interface PopupItem {
    popupId : number;         //광고 팝업 번호
    title : string;           //광고 팝업 제목 
    content : string | null;  //광고 팝업 글
    linkUrl : string;         //광고 팝업 이미지 클릭시 링크 
    position : string;        //광고 위치 
    width : number;           //광고 너비 
    height : number;          //광고 높이 
    imageUrl : string;        //광고 이미지
}

//광고 컴포넌트에 기본적으로 넣을 객체 

