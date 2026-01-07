/**
 * 채팅 목록 응답
 */
export default interface ChatListResponse {
  chat_id: number;
  user_id: number;
  last_message: string;
  status: 'OPEN' | 'CLOSED';
  updated_at: string; // ISO date string
}

//단일 채팅을 나타내는 요약 정보 
/* 
chat_id: number; // 채팅 고유 ID
user_id: number; // 사용자 고유 ID
last_message: string; // 마지막 메시지 내용
status: 'OPEN' | 'CLOSED'; // 채팅 상태
updated_at: string; // 마지막 업데이트 시간 (ISO 날짜 문자열)
*/