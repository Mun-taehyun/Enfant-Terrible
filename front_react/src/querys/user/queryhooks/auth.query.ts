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

//useMutation 준비 => mutate() 호출 "수동시작 => 요청보냄" => onSuccess , onError 실행

//Mutation UI 상태 처리 boolean 값 반환 
// isIdle => 실행 o 시 true 반환 
// isPending => 요청 시 true 반환 
// isSuccess => 성공 시 true 반환 
// isError => 실패 시 true 반환 
//Mutation 에서 값을 가져올 때. await (async의 정지 처리를 기다려줌)
// => 반환값이 있을 때 mutateAsync(값) 으로 사용하면 됩니다.

import { useMutation } from '@tanstack/react-query';
import {
    signinRequest,
    emailCertificationRequest,
    emailCodeRequest,
    resetPasswordEmailRequest,
    resetPasswordCodeRequest,
    resetPasswordChangeRequest
} from '@/apis/user';
// import { authKey } from './keys'; => 키값이 필요한 상황이 생기면 사용. 

export const authQueries = {

    // ======================== C(추가) ========================

    // 로그인
    useSignin() {return useMutation({mutationFn: signinRequest,});},

    // 이메일 인증번호 발송
    useEmailCertification() {return useMutation({mutationFn: emailCertificationRequest,});},

    // 이메일 인증번호 검증
    useEmailCodeVerify() {return useMutation({mutationFn: emailCodeRequest,});},

    // 비밀번호 찾기 : 이메일 인증번호 요청
    useResetPasswordEmail() {return useMutation({mutationFn: resetPasswordEmailRequest,});},

    // 비밀번호 찾기  인증번호 검증 요청
    useResetPasswordCode() {return useMutation({mutationFn: resetPasswordCodeRequest,});},

    // 비밀번호 재설정
    useResetPasswordChange() {return useMutation({mutationFn: resetPasswordChangeRequest,});},
};





