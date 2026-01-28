//채팅서버 입장 시 1st 서버에 채팅방 생성 요청 
//      => 캐싱처리 reactQuery

//발급받은 RoomId로 접속 2nd SockJs 엔드포인트 연동 

import { getQnaRoomRequest } from "@/apis/user";
import { useQuery } from "@tanstack/react-query";

interface Props {
    userId : string | number
}

export default function Chat({userId} : Props) {

    const q = useQuery({
        queryKey: ["chat", userId],
        queryFn: () => getQnaRoomRequest(),
    });

    if (q.isLoading) return null;
    if (q.error) return null;

    return (
        <div>
            {q.data ? JSON.stringify(q.data) : null}
        </div>
    );
}