export interface ChangeCategoryStatusRequest {
  is_activated?: boolean; 

}
/* 넣어야 되는 규칙
카테고리 활성/비활성 상태를 변경하기 위한 Request DTO
카테고리를 삭제하지 않고 상태만 전환하기 위해 사용하기 위해 is_activated 필드만 포함
Data Transfer Object(데이터 전송 객체)
*/