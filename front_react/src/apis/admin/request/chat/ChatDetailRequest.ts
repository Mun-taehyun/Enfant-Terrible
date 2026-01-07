/**
 * 채팅 상세 조회
 * (보통 path param으로 처리하지만, 확장 대비)
 */
export default interface ChatDetailRequest {
  chat_id: number;
}
/* 넣어야 되는 규칙 
  - chat_id: 채팅 고유 아이디 조회 조건, 특정 채팅 상세 정보 조회 조건이다.     
*/