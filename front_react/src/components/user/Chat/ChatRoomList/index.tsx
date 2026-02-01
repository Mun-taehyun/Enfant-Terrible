import ChatRoomListItem from "../ChatRoomItem";
import { qnaQueries } from "@/querys/user/queryhooks";
import './style.css';

export default function ChatRoomList({ onSelectRoom }: { onSelectRoom: (id: number) => void }) {

  const { data: roomData } = qnaQueries.useGetQnaRoom();
  const items = roomData ? [roomData] : [];

return (
    <div className="room-list-container">
      <div className="list-header">대화 목록</div>
      <div className="list-body">
        {items?.map((room) => (
          <ChatRoomListItem 
            key={room.roomId}
            chatItem={room}
            onClick={onSelectRoom}
          />
        ))}
      </div>
    </div>
  );
}