export default interface QnaRoomResponseDto {
    roomId : number;                //채팅방 pk
    userId : number;                //유저 pk
    status : string;                //채팅방 상태

    unread : number;                //미확인 메시지 수

    lastMessageAt : string;         //마지막 채팅 시간
    createdAt : string;             //만들어진 시간
}

