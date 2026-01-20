export default interface CategoryItem {
    categoryId : number;
    parentId : number | null;
    name : string;
    depth : number | string;
    sortOrder : number; 
    status : string;
}

//   카테고리 상태 
//   ACTIVE("Y"),
//   INACTIVE("N"); 활성화 비활성화 여부 