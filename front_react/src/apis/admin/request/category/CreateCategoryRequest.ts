export interface CreateCategoryRequest {
  name: string;           
  parent_id?: number | null;
  sort_order?: number;    
}

/* 넣어야 되는 규칙
name: string; 카테고리 이름 (필수), 존재이유: 사용자에게 보여지는 카테고리 명칭
parent_id?: number | null; 부모 카테고리 ID (최상위 카테고리인 경우 null), 존재이유: 카테고리 계층 구조 파악
sort_order?: number; 카테고리 정렬 순서 (기본값: 0), 존재이유: 카테고리 표시 순서 지정
카테고리를 만들 때만 “어디에 속할지”를 정함, 구조를 처음 정의하는 시점
*/