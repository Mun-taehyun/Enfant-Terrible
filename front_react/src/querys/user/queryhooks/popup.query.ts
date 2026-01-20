import { useQuery } from "@tanstack/react-query";
import { popupKeys } from "../keys/key";
import { getPopupListRequest } from "@/apis/user";



export const usePopups = () => {

    //쿼리 : 광고팝업 조회
    return useQuery({
        queryKey: popupKeys.lists(),
        queryFn: getPopupListRequest,
    });
};