export default interface CategoryItem {
    categoryId : number | string;
    parentId : number | string | null;
    name : string;
    depth : number | string;
    sortOrder : number; 
    isActivated : boolean;
}