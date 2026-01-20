export default interface PointChangeRequestDto {
    amount : number;    //포인트 양
    reason : string;    //이유 
    refType : string;  //참조타입
    refId : number;     //참조번호 
}