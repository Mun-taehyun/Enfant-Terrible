export default interface QnaMessageResponseDto {
    messageId : number; //메세지 pk
    roomId : number;    //채팅방 pk
    sender : string;    //보낸사람 
    message : string;   //메세지
    createdAt : string; //채팅생성시간

    imageUrls : string[];   //이미지 배열
}
//채팅 메세지 