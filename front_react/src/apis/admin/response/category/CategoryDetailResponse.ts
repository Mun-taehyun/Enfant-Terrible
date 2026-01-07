export interface CategoryDetailResponse {
  category_id: number;      // 결과 식별자 (필수)
  name: string;
  parent_id: number | null; 
  depth: number;
  sort_order: number;
  is_activated: boolean;
}

/* 넣어야 되는 규칙
category_id: number; 결과 식별자 (필수), 존재이유: 카테고리 고유 아이디 
parent_id: number | null; 부모 카테고리 ID (최상위 카테고리인 경우 null), 존재이유: 카테고리 계층 구조 파악 
*/