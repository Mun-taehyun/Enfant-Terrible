export default interface PointHistoryResponseDto {
    pointHistoryId : number; //포인트 사용 기록 pk
    pointAmount : number;    //포인트 양 
    pointType : string;      // 어떤 것에 사용되었는 지 

    reason : string;        // 사유
    refType : string;       //참조타입
    refId: number;          //참조아이디

    createdAt : string;     //사용날짜 
}