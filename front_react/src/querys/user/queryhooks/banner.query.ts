import { getBannerListRequest } from "@/apis/user";
import { bannerKeys } from "../keys/key";
import { useQuery } from "@tanstack/react-query";

export const bannerQueries = {

    //쿼리 : 배너 리스트 조회 
    useBannerList() {
        return useQuery({
            queryKey: bannerKeys.lists(),
            queryFn: getBannerListRequest,
            select: (data) => ({ bannerList: Array.isArray(data) ? data : [] })
        })
    },
};