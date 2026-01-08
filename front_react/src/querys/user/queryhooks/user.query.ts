import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '../queryClient';
import { userKey } from '../keys';

import {
    signupRequest, //회원가입 요청
    userSelectRequest, //유저정보 조회 
    userUpdateRequest, //유저정보 수정
    passwordUpdateRequest, //비밀번호 수정
    userDeleteRequest, //회원탈퇴
    oauthAddInformationRequest, //소셜 회원가입 시 추가정보 기입 
    petAddInsertRequest, //펫 정보 등록
    petSeleteRequest, //펫 정보 조회(전체)
    petUpdateRequest, //펫 정보 수정
    petDeleteRequest //펫 정보 삭제 
} from '@/apis/user';

//가장 알아둬야 할 점 queryKey는 클라이언트의 캐시 즉. 유저의 데이터를 위주로 판단함. 


export const userQueries = {

    // =========================== 조회 쿼리 ======================== 
    // 내 정보 조회 
    useMe() {
        return useQuery({
        queryKey: userKey.me(),
        queryFn: userSelectRequest
        });
    },

    // 펫 정보 목록 조회
    usePets() {
        return useQuery({
        queryKey: userKey.pets(),
        queryFn: petSeleteRequest
        });
    },

    // ========================CUD 변경 쿼리 ===========================

    // 회원가입 C(추가) 쿼리 => 완료 
    useSignUp() {
        return useMutation({
            mutationFn: signupRequest,
        });
    },

    //소셜회원가입 C(추가) 쿼리 
    useOauthAddInformation() {
        return useMutation({
            mutationFn: oauthAddInformationRequest,
            onSuccess: () => {
                queryClient.invalidateQueries({queryKey: userKey.me()});
            }
        });
    },

    // 비밀번호 변경 U(수정) 쿼리
    usePasswordUpdate() {
        return useMutation({mutationFn: passwordUpdateRequest}); 
        //클라이언트를 갱신할 필요성이 없는 행위 .. 
    },

    // 유저 수정, 삭제
    useUserUpdate() {
        return useMutation({
            mutationFn: userUpdateRequest,
            onSuccess: () => {queryClient.invalidateQueries({queryKey: userKey.me()});}
        });
    },

    useUserDelete() {
        return useMutation({
            mutationFn: userDeleteRequest,onSuccess: () => {queryClient.removeQueries({queryKey: userKey.me()});}
        });
    },

// ===============================펫 정보 변경 CUD ========================
    //사용할 펫정보 등록 
    usePetAdd() {
        return useMutation({
            mutationFn: petAddInsertRequest,
            onSuccess: () => {queryClient.invalidateQueries({queryKey: userKey.pets()});}
        });
    },

    //사용할 펫 정보 수정 =======================
    usePetUpdate() { 
        return useMutation({
            mutationFn: petUpdateRequest,
            onSuccess: () => {queryClient.invalidateQueries({queryKey: userKey.pets()}); }
        });
    },

    //사용할 펫정보 삭제 ==================
    usePetDelete() {
        return useMutation({
        mutationFn: petDeleteRequest,
            onSuccess: () => {queryClient.invalidateQueries({queryKey: userKey.pets()});}
        });
    }
};