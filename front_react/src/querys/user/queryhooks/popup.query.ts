import { useQuery } from "@tanstack/react-query";
import { popupKeys } from "../keys/key";
import { getPopupListRequest } from "@/apis/user";


export const popupQueries = {

    //쿼리 : 광고팝업 조회
    usePopup () {
        return useQuery({
            queryKey: popupKeys.lists(),
            queryFn: getPopupListRequest,
            select: (data) => {
                if (Array.isArray(data)) return { popupList: data };
                if (data && typeof data === "object" && Array.isArray((data as any).popupList)) {
                    return { popupList: (data as any).popupList };
                }
                return { popupList: [] };
            }
        });
    }
};