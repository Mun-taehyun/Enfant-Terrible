import type { CategoryItem } from "@/types/user/interface";

export default interface GetCategoryListResponseDto {
    categoryListItem: CategoryItem[];
} // 전체 카테고리 리스트를 가져온다. 