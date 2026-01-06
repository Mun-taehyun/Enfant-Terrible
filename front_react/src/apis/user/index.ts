import type { CheckCertificationRequestDto, EmailCertificationRequestDto, PasswordSearchRequestDto, SignInRequestDto, SignUpRequestDto } from "./request/auth";
import type { PostChatRoomIdRequestDto } from "./request/chat";
import apiClient from "..";
import type { GetPopupListResponseDto } from "./response/popup";
import type { PostChatRoomIdResponseDto } from "./response/chat";
import type { SignInResponseDto } from "./response/auth";
import type GetCategoryListResponseDto from "./response/category/get-category-list.response.dto";


// //권한 용 헤더로 보낼 엑세스토큰 사용 "제품 사용 등..."
// const authorization = (accessToken: string) => {
//     return { headers: {Authorization: `Bearer ${accessToken}`}}
// };

// //엑세스 토큰 발급 용 리프레쉬토큰 사용 
// const getAccessToken = (reflashToken: string) => {
//     return { headers: {Autorization: `Bearer ${reflashToken}`}}
// };


//공통 부분을 지정 => then , catch 통합 => 적용 
// const responseHandler = <T> (response: AxiosResponse<T>) => {
//     const responseBody: T = response.data;
//     return responseBody;
// }




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
const SIGN_IN_URL = () => `/auth/sign-in` //로그인
const SIGN_UP_URL = () => `/auth/sign-up` //회원가입
//추가 요청사항 => 이메일 인증 api / 이메일 검증 api /비밀번호 변경 API
const EMAIL_CERTIFICATION_URL = () => `/auth/email-certification`
const CHECK_CERTIFICATION_URL = () => `/auth/check-certification`
const PASSWORD_UPDATE = () => `/auth/password-update`

export const signinRequest = async(requestBody: SignInRequestDto) : Promise<SignInResponseDto> => {
    return apiClient.post(SIGN_IN_URL(), requestBody)
} //일반 로그인


export const signupRequest = async(requestBody: SignUpRequestDto) => {
    return apiClient.post(SIGN_UP_URL(), requestBody)
} //회원가입 

export const emailCertificationRequest = async (requestBody: EmailCertificationRequestDto) => {
    return apiClient.post(EMAIL_CERTIFICATION_URL(), requestBody)

} //인증번호 전송요청 

export const checkCertificationRequest = async (requestBody: CheckCertificationRequestDto) => {
    return apiClient.post(CHECK_CERTIFICATION_URL(), requestBody)
} //인증번호 검증요청 

export const passwordUpdate = async (requestBody: PasswordSearchRequestDto ) => {
    return apiClient.patch(PASSWORD_UPDATE(), requestBody)
} //비밀번호 변경 요청 



// ================================ 소셜 ===================================





// ================================ 카테고리 =============================
const GET_CATEGORY_LIST_URL = () => `/category/get-List`;

export const getCategoryListRequest = async () : Promise<GetCategoryListResponseDto> => {
    return apiClient.post(GET_CATEGORY_LIST_URL())};
//카테고리 리스트를 서버에 요청 





// ================================ 상품 =================================





// ================================ 주문/결제 ============================





// ================================ 장바구니 ================================





// ================================   채팅 ================================
const POST_CHATROOM_ID_URL = () => `/chat/room`;
// => jwt 토큰 여부도 있어야 한다 . "회원 한정이므로"


export const postChatRoomIdRequest = async (requestBody : PostChatRoomIdRequestDto ) : Promise<PostChatRoomIdResponseDto> => {
    return apiClient.post(POST_CHATROOM_ID_URL(), requestBody )}; 
    //roomId 발급과정 






//==================================  광고 ===============================
//광고 팝업 리스트 불러오기
const GET_POPUP_LIST_URL = () => `/popup/popup-list`;

export const getPopupListRequest = async () : Promise<GetPopupListResponseDto> => {
    return apiClient.get(GET_POPUP_LIST_URL());};


//===================================== 배너 ======================================



// =================================== 마이페이지 ==========================





//====================================== 파일 ===============================

const FILE_DOMAIN = `/file`;

const FILE_UPLOAD_URL = () => `${FILE_DOMAIN}/upload`;

export const fileUploadRequest = async (data: FormData) => {
    return apiClient.post(FILE_UPLOAD_URL(), data)
}; //백엔드 파일 DB데이터 가져오기 