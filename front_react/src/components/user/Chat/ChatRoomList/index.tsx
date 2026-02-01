import ChatRoomListItem from "../ChatRoomItem";
import { qnaQueries } from "@/querys/user/queryhooks";
import './style.css';

export default function ChatRoomList({ onSelectRoom }: { onSelectRoom: (id: number) => void }) {

  //서버상태 : 채팅방 하나 조회 
  const { data: roomData} = qnaQueries.useGetQnaRoom();

return (
    <div className="room-list-container">
      <div className="list-header">대화 목록</div>
      <div className="list-body">
        {roomData ? (
            <ChatRoomListItem 
              key={roomData.roomId}
              chatItem={roomData}
              onClick={() => onSelectRoom(roomData.roomId)}
            />
          )
          : 
          (
          /* 리스트가 없을 때 중앙에 표시될 구문 */
          <div className="room-list-empty">
            <div className="empty-icon">💬</div>
            <p>참여하고 있는 채팅방이 없습니다.</p>
          </div>
          )}
      </div>
    </div>
  );
}