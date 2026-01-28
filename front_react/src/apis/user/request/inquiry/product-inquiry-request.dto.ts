export default interface ProductInquiryRequestDto {
    content : string;
    isPrivate : boolean;
    imageUrls : string[] | null;
}