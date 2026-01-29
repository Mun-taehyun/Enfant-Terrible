import { CategoryChildItem } from "@/apis/user/response/category/get-category-children.response.dto";

export default interface CategoryItem {
    categoryId : number;
    parentId : number | null;
    name : string;
    depth : number | string;
    sortOrder : number; 
    status : string;

    children : CategoryChildItem[];
    //자식 요소들 배열 
}

//   카테고리 상태 
//   ACTIVE("Y"),
//   INACTIVE("N"); 활성화 비활성화 여부 