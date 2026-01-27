

//채팅서버 입장 시 1st 서버에 채팅방 생성 요청 
//      => 캐싱처리 reactQuery

//발급받은 RoomId로 접속 2nd SockJs 엔드포인트 연동 

import { postChatRoomIdRequest } from "@/apis/user";
import { useQuery } from "@tanstack/react-query";

interface Props {
    userId : string | number
}

export default function Chat({userId} : Props) {

    const [data, error, isLoading] = useQuery({
        queryKey: ["chat", userId],
        queryFn: postChatRoomIdRequest(userId)
    })


}