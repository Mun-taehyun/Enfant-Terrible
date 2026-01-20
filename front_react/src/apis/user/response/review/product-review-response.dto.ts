export default interface ProductReviewResponseDto {
    reviewId : number;
    userId : number;
    productId : number;
    orderId : number;               //PK

    rating : number;
    content : string;               //평점 , 내용

    createdAt : string;
    updatedAt : string;             //생성, 수정 시간
}