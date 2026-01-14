export default interface GetProductDetailListResponseDto {
    productId: number;
    categoryId: number;
    categoryName: string;
    name: string;
    desciption: string;
    price: number;
    thumbnailUrl: string;
    contentImageUrl: string[];
}
//상품 상세조회 