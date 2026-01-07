/**
 * 채팅 상태 변경 (관리자)
 */
export default interface ChangeChatStatusRequest {
  status: 'OPEN' | 'CLOSED';
}

/* 넣어야 되는 규칙
 - status: 채팅의 상태(열림/닫힘)를 기준으로 필터링하기 위한 선택적 필드
*/