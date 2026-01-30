import { ChatRoomItem } from "@/apis/user/response/qna/qna-room-response.dto";
import ChatRoomListItem from "../ChatRoomItem";
import { qnaQueries } from "@/querys/user/queryhooks";
import './style.css';

export default function ChatRoomList({ onSelectRoom }: { onSelectRoom: (id: number) => void }) {
  const { data: roomData, isLoading } = qnaQueries.useGetQnaRoom();

   const items = Array.isArray(roomData?.chatList) ? roomData.chatList : [];

  if (isLoading) return <div className="loading-state">채팅방 목록을 불러오는 중...</div>;

  return (
    <div className="room-list-container">
      <div className="list-header">대화 목록</div>
      <div className="list-body">
        {items?.map((room: ChatRoomItem) => (
          <ChatRoomListItem 
            key={room.roomId}
            chatItem={room}
            onClick={() => onSelectRoom(room.roomId)}
          />
        ))}
      </div>
    </div>
  );
}