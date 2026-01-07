export interface UpdateCategoryRequest {
  name: string;           
  sort_order?: number;    
}

/* 넣어야 되는 규칙
name: string; 카테고리 이름 (필수), 존재이유 사용자에게 보여지는 카테고리 명칭
sort_order?: number; 정렬 순서 (없으면 서버 기본값), 존재이유: 카테고리 노출 순서 지정 
string: 문자열 타입 데이터 , number: 숫자 타입 데이터, boolean: 상태가 두 개인 경우의 최적 해답(쓴다/안쓴다) 
*/