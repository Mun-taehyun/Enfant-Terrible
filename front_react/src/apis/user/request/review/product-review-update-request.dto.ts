export default interface ProductReviewUpdateRequestDto {
    rating : number;
    content : string;

    imageUrls : string[];
}

//리뷰 수정 dto