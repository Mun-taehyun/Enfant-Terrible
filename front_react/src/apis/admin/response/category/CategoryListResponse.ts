export interface CategoryListResponse {
  category_id: number;      // 결과 식별자 (필수)
  name: string;
  depth: number;
  sort_order: number;
  is_activated: boolean;
}

