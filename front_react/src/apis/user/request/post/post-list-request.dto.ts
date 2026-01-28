export default interface PostListRequestDto {
    page : number;
    size : number;
    postType : string;
}

//게시물 타입 NOTICE , PRODUCT_DETAIL , EVENT 3가지... 