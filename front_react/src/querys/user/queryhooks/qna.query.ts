import { useQuery } from "@tanstack/react-query";
import { qnaKeys } from "../keys/key";
import { getQnaMessageRequest, getQnaRoomRequest } from "@/apis/user";


export const qnaQueries = {

    //쿼리 : 채팅방 목록 조회
    useGetQnaRoom() {
        return useQuery({
            queryKey: qnaKeys.rooms(),
            queryFn: getQnaRoomRequest,
            refetchOnWindowFocus: true,
            //메시지 동기화가 자주 일어나면 사용되는 옵션
            //사용자가 브라우저를 바라보면 데이터 고칠 지 여부
            select: (data) => data || null
        });
    },

    //쿼리 : 특정 채팅방 메시지 내역 조회
    useGetQnaMessages(roomId: number, limit: number) {
        return useQuery({
            queryKey: qnaKeys.messageList(roomId, limit),
            queryFn: () => getQnaMessageRequest(roomId, limit),
            enabled: !!roomId, 
            placeholderData: (previousData) => previousData,
            // 새로운 메시지가 추가되었을 때 기존 메시지들을 유지하며 UX 향상
            select: (data) => ({ messageList: Array.isArray(data) ? data : [] })
        });
    },
};