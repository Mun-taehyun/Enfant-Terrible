//채팅서버 입장 시 1st 서버에 채팅방 생성 요청 
//      => 캐싱처리 reactQuery

import './style.css';
import ChatRoom from "@/components/user/Chat/ChatMessageList";
import { qnaQueries } from "@/querys/user/queryhooks";

//발급받은 RoomId로 접속 2nd SockJs 엔드포인트 연동 


export default function ChatQna() {
    const { data: roomData, isLoading } = qnaQueries.useGetQnaRoom();

    return (
        <div className="chat-overlay-wrapper" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
            <div className="content-area">
                {isLoading ? (
                    <div className="loading">채팅을 불러오는 중...</div>
                ) : roomData?.roomId ? (
                    <ChatRoom roomId={roomData.roomId} showBack={false} />
                ) : (
                    <div className="no-room"> 참여 중인 대화가 없습니다. </div>
                )}
            </div>
        </div>
    );
}