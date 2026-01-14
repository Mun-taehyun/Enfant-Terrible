export default interface CategoryItem {
    categoryId : number;
    parentId : number | null;
    name : string;
    depth : number | string;
    sortOrder : number; 
    isActivated : boolean;
}