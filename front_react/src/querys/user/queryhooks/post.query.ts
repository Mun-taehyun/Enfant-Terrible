import PostListRequestDto from "@/apis/user/request/post/post-list-request.dto";
import { useQuery } from "@tanstack/react-query";
import { postKeys } from "../keys/key";
import { getPostDetailRequest, getPostRequest } from "@/apis/user";


export const postQueries = {
    
    //쿼리 : 게시물 리스트 조회
    useGetPosts(params: PostListRequestDto) {
        return useQuery({
            queryKey: postKeys.list(params),
            queryFn: () => getPostRequest(params),
            placeholderData: (previousData) => previousData, 
            // 페이징 시 리스트 깜빡임 방지(UX 개선)
        });
    },

    //쿼리: 게시물 상세 조회
    useGetPostDetail(postId: number) {
        return useQuery({
            queryKey: postKeys.detail(postId),
            queryFn: () => getPostDetailRequest(postId),
            enabled: typeof postId === 'number' && !isNaN(postId),
        });
    },
};