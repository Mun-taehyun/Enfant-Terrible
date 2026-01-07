/**
 * 채팅 상세 응답
 */
export default interface ChatDetailResponse {
  chat_id: number;
  user_id: number;
  messages: {
    message_id: number;
    sender: 'USER' | 'ADMIN';
    content: string;
    created_at: string;
  }[];
  status: 'OPEN' | 'CLOSED';
}

//목록에서 빠르게 찾기 위한 상세 요약 
/* 
chat_id: number; // 채팅 고유 ID
user_id: number; // 사용자 고유 ID
message_id: number; // 메시지 고유 ID
sender: 'USER' | 'ADMIN'; // 메시지 발신자
content: string; // 메시지 내용
created_at: string; // 메시지 생성 시간 (ISO 날짜 문자열)
status: 'OPEN' | 'CLOSED'; // 채팅 상태
*/
