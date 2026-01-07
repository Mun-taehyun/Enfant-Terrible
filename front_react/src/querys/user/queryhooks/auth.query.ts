//useMutation<TData, TError, TVariables, TContext> 
// =============================== 타입 정리 ============= 
//TData : 성공 시 반환되는 데이터 
//TError : 실패 시 에러 타입
//TVariables: mutate에 전달하는 값 
//TContext: optimistic update용 임시 컨텍스트 



// ============================= 매개변수 정리 ===========
//mutationFn: (변수) => Promise<TData> : 서버에서 요청보내는 함수 
//        ==> mutate(requestBody) 로 전달된다 .. 

//onMutate: 요청 직전 처리 
//          => 1. 성공할 것이라고 확신하며 UI 교체 (채팅시스템에 많이쓰임)
//          => 2. 이전 캐시 저장 => 수정도중 이탈 시 상태보존 
//          => 3. 로딩 상태 사전 처리 

//onSuccess: 성공 시 함수 실행 (가장 효율 좋음)
//        ex) onSuccess: (data, variable, context) => {실행값}
//         => 1번 파라미터 data = mutationFn 반환값 (응답값)
//         => 2번 파라미터 variables = mutate에 넘긴 값    
//         => 3번 파라미터 context = onMutate 반환 값

import { useMutation } from '@tanstack/react-query';
import {
    signinRequest,
    emailCertificationRequest,
    emailCodeRequest,
    resetPasswordEmailRequest,
    resetPasswordCodeRequest,
    resetPasswordChangeRequest
} from '@/apis/user';
// import { authKey } from './keys';

    // ---------------------------
    // 1) 로그인
    // ---------------------------
    export const useSignin = () =>
    useMutation({
        mutationFn: signinRequest,
        // 필요 시 onSuccess 추가 가능
    });

    // ---------------------------
    // 2) 이메일 인증 요청
    // ---------------------------
    export const useEmailCertification = () =>
    useMutation({
        mutationFn: emailCertificationRequest,
    });

    // ---------------------------
    // 3) 이메일 인증번호 검증
    // ---------------------------
    export const useEmailCodeVerify = () =>
    useMutation({
        mutationFn: emailCodeRequest,
    });

    // ---------------------------
    // 4) 비밀번호 찾기 – 이메일 인증번호 요청
    // ---------------------------
    export const useResetPasswordEmail = () =>
    useMutation({
        mutationFn: resetPasswordEmailRequest,
    });

    // ---------------------------
    // 5) 비밀번호 찾기 – 인증번호 검증
    // ---------------------------
    export const useResetPasswordCode = () =>
    useMutation({
        mutationFn: resetPasswordCodeRequest,
    });

    // ---------------------------
    // 6) 비밀번호 재설정
    // ---------------------------
    export const useResetPasswordChange = () =>
    useMutation({
        mutationFn: resetPasswordChangeRequest,
    });





