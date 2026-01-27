import { CategoryItem } from "@/types/user/interface";


// 있는 CategoryItem 에서 제한 조건을 줌 => 불필요한 타입지정 안함 
export interface CategoryChildItem extends CategoryItem {
    parentId: number; // null을 허용하지 않는다 = 자식 카테고리만 따로 타입지정 
}

//Dto 타입 지정 자식위주.... 
export default interface GetCategoryChildrenResponseDto {
    childCategories: CategoryChildItem[];
}