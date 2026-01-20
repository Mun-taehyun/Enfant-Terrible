export default interface Product {
    productId: number;              //제품id
    categoryId: number;             //카테고리id
    categoryName: string;           //카테고리이름
    name: string;                   //제품이름
    description: string;            //제품내용(간단)
    price: number;                  //제품가격 (최저 sku 가격)

    discountType : string;          //할인타입 
    discountValue : number;         //할인값;
    discountedPrice : number;       //할인가격;

    averageRating : number;         //평점
    reviewCount : number;           //리뷰수

    thumbnailUrl: string;           //제품이미지 
}
