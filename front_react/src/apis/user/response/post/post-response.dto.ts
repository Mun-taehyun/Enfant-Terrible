export default interface PostResponseDto {
    postId : number;                //게시물 pk
    postType : string;              //게시물 타입
    title : string;                 //게시물 제목
    contant : string;               //게시물 내용
    createAt : string;              //게시물 생성날
    updateAt : string;              //게시물 수정날

    imageUrls : string[];           //이미지 배열 
}