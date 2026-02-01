
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import { ChatMessageItem } from '@/apis/user/response/qna/qna-message-response.dto';
import { useQueryClient } from '@tanstack/react-query';
import { qnaKeys } from '@/querys/user/keys/key';
import { qnaQueries } from '@/querys/user/queryhooks';
import './style.css';

interface ChatRoomProps {
  roomId: number;
  onBack: () => void;
}

export default function ChatRoom({ roomId, onBack }: ChatRoomProps) {
  const queryClient = useQueryClient();
  const limit = 50; // useQuery와 일치시켜야 함
  const [input, setInput] = useState('');
  const stompClient = useRef<Client | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. React Query 데이터 로드 (select를 통해 messageList 추출됨)
  const { data: chatData, isLoading } = qnaQueries.useGetQnaMessages(roomId, limit);
  const messages = useMemo(() => chatData?.messageList || [], [chatData]);

  // 2. 읽음 처리 알림 전송 (useCallback으로 메모이제이션)
  const sendReadReceipt = useCallback((lastMessageId: number) => {
    if (stompClient.current?.connected) {
      stompClient.current.publish({
        destination: '/app/qna.read',
        body: JSON.stringify({ roomId, lastReadMessageId: lastMessageId }),
      });
    }
  }, [roomId]);

  // 3. 메시지 수신 핸들러 (캐시를 직접 업데이트)
  const handleIncomingMessage = useCallback((tick: IMessage) => {
    const newMessage: ChatMessageItem = JSON.parse(tick.body);
    
    if (newMessage.roomId === roomId) {
      // 서버에서 select로 가공하기 전의 원본 캐시 데이터 구조(배열)를 업데이트
        queryClient.setQueryData<ChatMessageItem[]>(
          qnaKeys.messageList(roomId, limit),
          (old) => {
            const prev = old ?? [];
            if (prev.some(m => m.messageId === newMessage.messageId)) return prev;
            return [...prev, newMessage];
          }
        );
          
        if (newMessage.sender === 'ADMIN') {
          sendReadReceipt(newMessage.messageId);
        }
    };
      
      // 받은 메시지가 내가 보낸 게 아닐 때만 읽음 처리 (선택 사항)
      sendReadReceipt(newMessage.messageId);
    }
  , [roomId, queryClient, sendReadReceipt, limit]);

  // 4. STOMP 연결 및 구독
  useEffect(() => {
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      onConnect: () => {
        console.log('STOMP Connected');
        client.subscribe(`/user/queue/qna/messages`, handleIncomingMessage);
      },
      onStompError: (frame) => {
        console.error('STOMP Error:', frame.headers['message']);
      },
    });

    stompClient.current = client;
    client.activate();

    return () => {
      client.deactivate();
    };
  }, [roomId, handleIncomingMessage]);

  // 5. 메시지 전송 (텍스트 + 이미지 대응)
  const handleSend = useCallback((text: string, urls: string[] = []) => {
    if ((!text.trim() && urls.length === 0) || !stompClient.current?.connected) return;

    const request = {
      roomId: roomId,
      message: text,
      imageUrls: urls,
    };

    stompClient.current.publish({
      destination: '/app/qna.send',
      body: JSON.stringify(request),
    });

    setInput('');
  }, [roomId]);

  // 6. 스크롤 하단 고정
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (isLoading) return <div className="loading">채팅을 불러오는 중...</div>;




  return (
    <div className="chat-room-container">
      {/* 헤더 */}
      <div className="chat-header">
        <div className="back-btn" onClick={onBack}>←</div>
        <div className="header-info">
          <div className="header-title">앙팡테리블 상담톡</div>
          <div className="header-status">앙팡테리블 마켓 채팅에 오신 것을 환영합니다.</div>
        </div>
      </div>

      {/* 대화 영역 */}
      <div className="message-area" ref={scrollRef}>
        {messages.map((msg : ChatMessageItem) => {
          // 💡 유저 전용 컴포넌트이므로 sender가 'USER'면 본인임
          const isMine = msg.sender === 'USER';

          return (
            <div key={msg.messageId} className={`message-row ${isMine ? 'me' : 'other'}`}>
              {!isMine && <div className="admin-avatar">👩‍💻</div>}
              <div className="message-content">
                {/* 이미지 전송 건이 있을 경우 렌더링 */}
                {msg.imageUrls?.length > 0 && (
                  <div className="bubble-images">
                    {msg.imageUrls.map((url, i) => (
                      <img key={i} src={url} alt="첨부 이미지" />
                    ))}
                  </div>
                )}
                {msg.message && <div className="bubble">{msg.message}</div>}
                <span className="time">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 입력 영역 */}
      <div className="input-container">
        <div className="input-box">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              // 한글 중복 입력 방지 및 엔터 처리
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                handleSend(input);
              }
            }}
            placeholder="문의 내용을 입력하세요..."
          />
          <div 
            className={`send-btn ${input.trim() ? 'active' : ''}`} 
            onClick={() => handleSend(input)}
          >
            전송
          </div>
        </div>
      </div>
    </div>
  );
}