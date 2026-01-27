export default interface InquiryItem {
    inquiryId: number,                  //문의pk
    productId: number,                  //제품pk
    userId: number,                     //사용자pk
    userEmail: string,                  
    content: string,
    imageUrls: string[],
    isPrivate: boolean,                 //비밀글여부
    status: string,             
    answerContent: string,              //답변내용
    answeredByUserId: string,           //답변자
    answeredAt: string,                 //답변시간
    createdAt: string,                  //생성시간
    updatedAt: string                   //수정시간
}
