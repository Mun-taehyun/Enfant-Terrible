const ChatRooms = () => {
  const chatRooms = [
    {
      id: 1,
      userName: '홍길동',
      userEmail: 'hong@test.com',
      lastMessage: '배송 문의드립니다.',
      updatedAt: '2025-01-05 10:20',
      status: 'UNREAD', // UNREAD | ANSWERED
    },
    {
      id: 2,
      userName: '김영희',
      userEmail: 'kim@test.com',
      lastMessage: '환불 가능할까요?',
      updatedAt: '2025-01-05 09:45',
      status: 'ANSWERED',
    },
  ];

  return (
    <div>
      <h2>사용자 채팅방 관리</h2>
      <p>사용자와의 1:1 채팅방 목록을 관리합니다.</p>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th>사용자</th>
            <th>이메일</th>
            <th>최근 메시지</th>
            <th>최근 활동</th>
            <th>상태</th>
            <th>관리</th>
          </tr>
        </thead>

        <tbody>
          {chatRooms.map((room) => (
            <tr key={room.id}>
              <td>{room.userName}</td>
              <td>{room.userEmail}</td>
              <td>{room.lastMessage}</td>
              <td>{room.updatedAt}</td>
              <td>
                {room.status === 'UNREAD' ? '미응답' : '응답완료'}
              </td>
              <td>
                <button onClick={() => handleOpen(room.id)}>
                  채팅방 열기
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* 🔹 나중에 상세 채팅 페이지로 이동 */
const handleOpen = (roomId: number) => {
  console.log('채팅방 열기:', roomId);
  // navigate(`/admin/chats/${roomId}`);
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  marginTop: '20px',
  borderCollapse: 'collapse',
};

export default ChatRooms;
