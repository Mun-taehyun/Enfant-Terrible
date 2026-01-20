export default interface ProductReviewCreateRequestDto {
    orderId : number;
    rating: number;                 //평점
    content : string;               //내용
}
//리뷰 생성 dto