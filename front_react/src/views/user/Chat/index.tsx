//채팅서버 입장 시 1st 서버에 채팅방 생성 요청 
//      => 캐싱처리 reactQuery

import ChatWait from "@/components/user/Chat/WaitChat";
import { useState } from "react";
import './style.css';
import ChatRoomList from "@/components/user/Chat/ChatRoomList";
import ChatRoom from "@/components/user/Chat/ChatMessageList";
import { qnaQueries } from "@/querys/user/queryhooks";

//발급받은 RoomId로 접속 2nd SockJs 엔드포인트 연동 



export default function ChatQna() {
    const [view, setView] = useState<'chat' | 'home' | 'list'>('home');
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
    const {data : roomData} = qnaQueries.useGetQnaRoom();

    // 1. 신규 방 생성 후 입장 (ChatWait에서 호출)
    const handleCreateAndEnterRoom = () => {
        if(!roomData) return;
        const lastId = roomData?.chatList?.length > 0 
            ? Math.max(...roomData.chatList.map(r => r.roomId)) 
            : 0;

        const nextId = lastId + 1;        

        setSelectedRoomId(nextId);
        setView('chat');
    };

    // 2. 기존 방 선택 후 입장 (ChatRoomList에서 호출)
    const handleSelectRoom = (roomId: number) => {
        setSelectedRoomId(roomId);
        setView('chat');
    };

    return (
        <div className="chat-overlay-wrapper">
            {/* 위젯 상단에 항상 'X' 버튼이나 공통 헤더를 둘 수 있음 */}
            
            <div className="content-area">
                {view === 'home' && (
                <ChatWait onStartChat={() => handleCreateAndEnterRoom()} />
                )}

                {view === 'list' && (
                <ChatRoomList onSelectRoom={handleSelectRoom} />
                )}

                {view === 'chat' && selectedRoomId && (
                <ChatRoom
                    roomId={selectedRoomId} 
                    onBack={() => setView('list')} // 채팅방에서 뒤로가면 목록으로 이동
                />
                )}
            </div>

            {/* 하단 내비게이션: 홈과 목록 이동용 */}
            <div className="widget-bottom-nav">
                <div 
                className={`nav-item ${view === 'home' ? 'active' : ''}`} 
                onClick={() => setView('home')}
                >
                홈
                </div>
                <div 
                className={`nav-item ${view === 'list' || view === 'chat' ? 'active' : ''}`} 
                onClick={() => setView('list')}
                >
                대화
                </div>
            </div>
        </div>
    );
}