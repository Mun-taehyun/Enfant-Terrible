import axios, { type AxiosResponse } from "axios";
import type {GetPopupListResponseDto} from "./response/popup";
import type { CheckCertificationRequestDto, EmailCertificationRequestDto, PasswordSearchRequestDto, SignInRequestDto, SignUpRequestDto } from "./request/auth";
import type { SignInResponseDto } from "./response/auth";
import type { PostChatRoomIdRequestDto } from "./request/chat";
import type { PostChatRoomIdResponseDto } from "./response/chat";


//도메인 관리용 변수정리  
const DOMAIN = 'http://localhost:4000';
const API_DOMAIN = `${DOMAIN}/api`;


//권한 용 헤더로 보낼 엑세스토큰 사용 "제품 사용 등..."
const authorization = (accessToken: string) => {
    return { headers: {Autorization: `Bearer ${accessToken}`}}
};

// //엑세스 토큰 발급 용 리프레쉬토큰 사용 
// const getAccessToken = (reflashToken: string) => {
//     return { headers: {Autorization: `Bearer ${reflashToken}`}}
// };


//공통 부분을 지정 => then , catch 통합 => 적용 
const responseHandler = <T> (response: AxiosResponse<T>) => {
    const responseBody: T = response.data;
    return responseBody;
}

const errorHandler = (error: unknown): number | null  => {
    if(typeof error !== 'object' || error === null ) return null;
    //error의 타입을 한정 시켜주는 작업 => 집에서 수정 
    if(!error.response || !error.response.status) return null;
    const responseBody: number = error.response.status;
    return responseBody;
}


//axios 통신 

//성공 시 response 반환 (2xx 상태코드)
// response = {data:any , status:number, statusText:string, headers:object, config:object, request:XMLHttpRequest}
// data => 서버에서 돌아온 응답 데이터 (spring 컨트롤러 등...)
// status => Http 상태 코드 200, 201 등... 
// statusText => 'OK' 'Bad Request' 등... 
// headers => 응답 헤더 
/*
    content-type => JSON / 파일 여부 판단
    authorization => JWT 토큰 갱신 
    set-cookie => 세션 / 리프레시 토큰 

*/
// config => 요청 시 사용한 axios 설정 
// request 

//실패 시 error.response 반환 (NOT 2xx 상태코드) response랑 거의 유사.. 
// error.response = {response와 거의 일치}







//================================= 인증 =================================
//로그인/회원가입
const SIGN_IN_URL = () => `${API_DOMAIN}/auth/sign-in` //로그인
const SIGN_UP_URL = () => `${API_DOMAIN}/auth/sign-up` //회원가입
//추가 요청사항 => 이메일 인증 api / 이메일 검증 api /비밀번호 변경 API
const EMAIL_CERTIFICATION_URL = () => `${API_DOMAIN}/auth/email-certification`
const CHECK_CERTIFICATION_URL = () => `${API_DOMAIN}/auth/check-certification`
const PASSWORD_UPDATE = () => `${API_DOMAIN}/auth/password-update`

export const signinRequest = async(requestBody: SignInRequestDto) => {
    const result = await axios.post(SIGN_IN_URL(), requestBody)
        .then(response => {
            const responseBody: SignInResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if(!error.response) return;
            const responseBody: string | number = error.response.status;
            return responseBody; //상태코드로 간단하게 처리 
        });
    return result;
} //일반 로그인


export const signupRequest = async(requestBody: SignUpRequestDto) => {
    const result = await axios.post(SIGN_UP_URL(), requestBody)
        .then(response => {
            const responseBody: string | number = response.status;
            return responseBody;
        })
        .catch(error => {
            if(!error.response) return;
            const responseBody: string | number = error.response.status;
            return responseBody;
        });
    return result;
} //회원가입 



export const emailCertificationRequest = async (requestBody: EmailCertificationRequestDto) => {
    const result = await axios.post(EMAIL_CERTIFICATION_URL(), requestBody)
        .then(responseHandler<string|number>) //응답코드.. 
        .catch(errorHandler);
    return result;
} //인증번호 전송요청 

export const checkCertificationRequest = async (requestBody: CheckCertificationRequestDto) => {
    const result = await axios.post(CHECK_CERTIFICATION_URL(), requestBody)
        .then(responseHandler<string|number>)
        .catch(errorHandler);
    return result;
} //인증번호 검증요청 

export const passwordUpdate = async (requestBody: PasswordSearchRequestDto ) => {
    const result = await axios.patch(PASSWORD_UPDATE(), requestBody)
        .then(responseHandler<string|number>)
        .catch(errorHandler);
    return result;
} //비밀번호 변경 요청 



// ================================ 소셜 ===================================




// ================================ 상품 =================================





// ================================ 주문/결제 ============================





// ================================ 장바구니 ================================





// ================================   채팅 ================================
const POST_CHATROOM_ID_URL = () => `${API_DOMAIN}/chat/room`;
// => jwt 토큰 여부도 있어야 한다 . "회원 한정이므로"


export const postChatRoomIdRequest = async (requestBody : PostChatRoomIdRequestDto , accessToken: string) => {
    const result = await axios.post(POST_CHATROOM_ID_URL(), requestBody , authorization(accessToken))
        .then(responseHandler<PostChatRoomIdResponseDto>)
        .catch(errorHandler);
    return result;
} //roomId 발급과정 






//==================================  광고 ===============================
//광고 팝업 리스트 불러오기
const GET_POPUP_List_URL = () => `${API_DOMAIN}/popup/popup-list`;

export const getPopupListRequest = async () => {
    const result = await axios.get(GET_POPUP_List_URL())
        .then(response => {
            const responseBody: GetPopupListResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if(!error.response) return;
            const responseBody: number | string = error.response.status;
            return responseBody; //상태코드로 간단하게 처리 
        });
    return result;
}

//===================================== 배너 ======================================



// =================================== 마이페이지 ==========================





//====================================== 파일 ===============================

const FILE_DOMAIN = `${DOMAIN}/file`;

const FILE_UPLOAD_URL = () => `${FILE_DOMAIN}/upload`;

const mutipartFormData = {headers: { 'Content-Type': 'multipart/form-data'}};

export const fileUploadRequest = async (data: FormData) => {
    const result = await axios.post(FILE_UPLOAD_URL(), data, mutipartFormData)
        .then(response => {
            const responseBody: string = response.data
            return responseBody;
        })
        .catch(error => {
            if(!error.response) return null;
            return null;
        });
    return result;
}; //백엔드 파일 DB데이터 가져오기 