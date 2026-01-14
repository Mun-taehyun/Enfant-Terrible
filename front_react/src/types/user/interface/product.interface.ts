export default interface Product {
    productId: number;              //제품id
    categoryId: number;             //카테고리id
    categoryName: string;           //카테고리이름
    name: string;                   //제품이름
    description: string;            //제품내용(간단)
    price: number;                  //제품가격
    thumbnailUrl: string;           //제품이미지 
}
