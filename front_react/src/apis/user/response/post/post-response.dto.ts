export default interface PostResponseDto {
    postList : PostItem[];
}


export interface PostItem {
    postId : number;                //게시물 pk
    postType : string;              //게시물 타입
    title : string;                 //게시물 제목
    content : string;               //게시물 내용
    createdAt : string;              //게시물 생성날
    updatedAt : string|null;              //게시물 수정날

    fileUrls : string[]|null;           //파일 url 배열 
}