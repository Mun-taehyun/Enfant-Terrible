/**
 * 관리자 채팅 목록 조회 조건
 */
export default interface ChatListRequest {
  user_id?: number;        // 특정 유저 기준 조회
  status?: 'OPEN' | 'CLOSED';
  keyword?: string;        // 메시지 검색
  page?: number;
  size?: number;
} 
/* 넣어야 되는 규칙 
  - ChatListRequest: 채팅목록 조회 조건 dto  
  - user_id: 특정 사용자와 관련된 채팅을 필터링하기 위한 선택적 필드
  - status: 채팅의 상태(열림/닫힘)를 기준으로 필터링하기 위한 선택적 필드
  - keyword: 채팅 메시지 내에서 특정 단어를 검색하기 위한 선택적 필드
  - page: 페이지네이션을 위한 현재 페이지 번호
  - size: 한 페이지당 표시할 채팅 목록의 수
  - Data Transfer Object(데이터 전송 객체)
*/