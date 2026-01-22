export default interface ProductReviewCreateRequestDto {
    orderId : number;
    rating: number;                 //평점
    content : string;               //내용
    imageUrls: string[];            //이미지 리스트
}
//리뷰 생성 dto