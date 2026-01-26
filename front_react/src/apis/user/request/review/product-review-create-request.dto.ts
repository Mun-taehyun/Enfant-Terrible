export default interface ProductReviewCreateRequestDto {
    reviewList : ProductReviewItem[];
}



export interface ProductReviewItem {
    orderId : number;
    rating: number;                 //평점
    content : string;               //내용
    imageUrls: string[];            //이미지 리스트
}
//여기서 orderId 빼가기. 
