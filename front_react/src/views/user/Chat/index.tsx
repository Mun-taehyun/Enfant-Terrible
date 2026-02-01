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
    const handleCreateAndEnterRoom = (e: React.MouseEvent) => {
        if(!roomData) return;
        
        e.preventDefault();
        e.stopPropagation();

        setSelectedRoomId(roomData.roomId);
        setView('chat');
    };

    // 2. 기존 방 선택 후 입장 (ChatRoomList에서 호출)
    const handleSelectRoom = (roomId: number) => {
        setSelectedRoomId(roomId);
        setView('chat');
    };

    return (
        <div className="chat-overlay-wrapper" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
            {/* 위젯 상단에 항상 'X' 버튼이나 공통 헤더를 둘 수 있음 */}
            
            <div className="content-area">
                    {/* 조건부 렌더링( && ) 대신 스타일로 제어 */}
                    <div style={{ display: view === 'home' ? 'block' : 'none' }}>
                        <ChatWait onStartChat={handleCreateAndEnterRoom} />
                    </div>

                    <div style={{ display: view === 'list' ? 'block' : 'none' }}>
                        <ChatRoomList onSelectRoom={handleSelectRoom} />
                    </div>

                    {/* 채팅창은 실제 ID가 있을 때만 렌더링하되, 입장 시 로딩 상태를 보여줘야 함 */}
                    <div style={{ display: view === 'chat' ? 'block' : 'none' }}>
                        {selectedRoomId ? (
                            <div style={{ display: view === 'chat' ? 'block' : 'none' }}>
                                <ChatRoom roomId={selectedRoomId} onBack={() => setView('list')} />
                            </div>
                        ) : (
                            <div className="no-room"> 참여 중인 대화가 없습니다. </div>
                        )}
                    </div>
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