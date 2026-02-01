import type QnaRoomResponseDto from "@/apis/user/response/qna/qna-room-response.dto";
import './style.css';

interface Props {
    chatItem : QnaRoomResponseDto;
    onClick : (id : number) => void;
}


//컴포넌트 : 채팅방 하나를 구성하는 조각
export default function ChatRoomListItem({chatItem, onClick} : Props) {


    // 시간 형식 변환 (필요에 따라 로직 추가)
    const displayTime = new Date(chatItem.lastMessageAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });


    return (
        <div className="chat-room-item" onClick={() => onClick(chatItem.roomId)}>
            <div className="item-profile">
                <div className="profile-circle">🐶</div>
            </div>

            <div className="item-info">
                <div className="info-top">
                <div className="room-name">반려동물용품점 앙팡테리블</div>
                <div className="room-time">{displayTime}</div>
                </div>
                <div className="info-bottom">
                <div className="status-text">상태: {chatItem.status}</div>
                {chatItem.unread > 0 && (
                    <div className="unread-badge">{chatItem.unread}</div>
                )}
                </div>
            </div>
        </div>
    );
}