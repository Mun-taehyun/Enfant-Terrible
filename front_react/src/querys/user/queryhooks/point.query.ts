import { useMutation, useQuery } from "@tanstack/react-query";
import { pointKeys } from "../keys/key";
import { queryClient } from "../queryClient";
import { getPointsMeHistoryRequest, getPointsMeRequest, postPointMeUseRequest, postPointsMeEarnRequest } from "@/apis/user";
import { PointChangeRequestDto } from "@/apis/user/request/point";


export const pointQueries = {

    //쿼리 : 포인트 잔액 조회
    useBalance: () => {
        const token = localStorage.getItem("accessToken");
        return useQuery({
            queryKey: pointKeys.balance(),
            queryFn: getPointsMeRequest,
            enabled: !!token
        });
    },

    //쿼리 : 포인트 기록 조회
    useHistory: (page: number | null, size: number | null) => {
        return useQuery({
            queryKey: pointKeys.history(page, size),
            queryFn: () => getPointsMeHistoryRequest(page, size),
            placeholderData: (previousData) => previousData,
            //이전데이터를 미리 노출 => UX 개선사항
        });
    },

    //쿼리 : 포인트 적립
    useEarn: () => {
        return useMutation({
            mutationFn: (requestBody: PointChangeRequestDto) => postPointsMeEarnRequest(requestBody),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: pointKeys.all });
                //포인트 잔액,포인트 히스토리 무효화
            },
        });
    },

    //쿼리 : 포인트 사용
    useUse: () => {
        return useMutation({
            mutationFn: (requestBody: PointChangeRequestDto) => postPointMeUseRequest(requestBody),
            onSuccess: () => {
                // 포인트 잔액과 히스토리 전체 무효화
                queryClient.invalidateQueries({ queryKey: pointKeys.all });
            },
        });
    },
};