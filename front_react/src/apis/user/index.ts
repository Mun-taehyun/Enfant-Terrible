import type { EmailCertificationRequestDto, EmailCodeRequestDto, ResetPasswordChangeRequestDto, ResetPasswordCodeRequestDto, SignInRequestDto } from "./request/auth";
import type { PostChatRoomIdRequestDto } from "./request/chat";
import apiClient from "..";
import type { GetPopupListResponseDto } from "./response/popup";
import type { PostChatRoomIdResponseDto } from "./response/chat";
import type { SignInResponseDto } from "./response/auth";
import type GetCategoryListResponseDto from "./response/category/get-category-list.response.dto";
import type { PetSelectResponseDto, SignUpResposeDto, UserSelectResponseDto } from "./response/user";
import type { OAuthAddInformationRequestDto, PetAddInsertRequestDto, PetUpdateRequestDto, SignUpRequestDto, UserUpdateRequestDto } from "./request/user";
import type PasswordUpdateRequestDto from "./request/user/password-update.request.dto";
import type ResetPasswordEmailRequestDto from "./request/auth/reset-password-email-request.dto";


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

// ============================== 사용자 ================================
const SIGN_UP_URL = () => `/users/sign-up` //회원가입
const USER_SELECT_URL = () => `/users/me` //내 정보 조회 
const USER_UPDATE_URL = USER_SELECT_URL; //내 정보 수정 
const PASSWORD_UPDATE_URL = () => `/users/me/password` //내 정보 수정 중 비밀번호 변경
const USER_DELETE_URL = () => `/users/me` //회원탈퇴
const OAUTH_ADD_INFORMATION_URL = () => `/users/me/profile/complete` // 소셜 회원가입 시 추가정보 요청
const PET_ADD_INSERT_URL = () => `/users/me/pets` // 반려동물 등록 
const PET_SELECT_URL = () => `/users/me/pets` //반려동물 목록 조회 
const PET_UPDATE_URL = (petId : string | number)  => `/users/me/pets/${petId}` //반려동물 수정 
const PET_DELETE_URL = (petId : string | number)  => `/users/me/pets/${petId}` //반려동물 삭제

export const signupRequest = async(requestBody: SignUpRequestDto) :Promise<SignUpResposeDto> => {
    return apiClient.post(SIGN_UP_URL(), requestBody)
} //회원가입 

export const userSelectRequest = async() :Promise<UserSelectResponseDto> => {
    return apiClient.get(USER_SELECT_URL())
} //내 정보 조회 

export const userUpdateRequest = async(requestBody: UserUpdateRequestDto) => {
    return apiClient.put(USER_UPDATE_URL(), requestBody)
} //내 정보 수정 

export const passwordUpdateRequest = async (requestBody: PasswordUpdateRequestDto ) => {
    return apiClient.put(PASSWORD_UPDATE_URL(), requestBody)
} //비밀번호 변경 요청 

export const userDeleteRequest = async () => {
    return apiClient.delete(USER_DELETE_URL())
}//회원탈퇴

export const oauthAddInformationRequest = async (requestBody: OAuthAddInformationRequestDto) => {
    return apiClient.post(OAUTH_ADD_INFORMATION_URL(), requestBody)
}//소셜 회원가입 시 추가 정보 입력 요청

export const petAddInsertRequest = async (requestBody: PetAddInsertRequestDto) => {
    return apiClient.post(PET_ADD_INSERT_URL(), requestBody)
}//반려동물 등록 요청 

export const petSeleteRequest = async () : Promise<PetSelectResponseDto> => {
    return apiClient.get(PET_SELECT_URL())
}//내 반려동물 목록 조회 

export const petUpdateRequest = async (petId: string |number) => (requestBody: PetUpdateRequestDto) => {
    return apiClient.put(PET_UPDATE_URL(petId), requestBody) //단일인자 매핑 useMutation은 data만 받는다....
}//내 반려동물 수정 

export const petDeleteRequest = async (petId: string|number) => {
    return apiClient.delete(PET_DELETE_URL(petId))
}//내 반려동물 정보 삭제







//================================= 인증 =================================
const SIGN_IN_URL = () => `/auth/login` //로그인
const EMAIL_CERTIFICATION_URL = () => `/auth/email/signup` //이메일 인증 메일 요청 
const EMAIL_CODE_URL = () => `/auth/email/verify` //이메일 인증번호 검증 요청
const RESET_PASSWORD_EMAIL_URL = () => `/auth/password/reset/request` //비밀번호 재설정 이메일요청
const RESET_PASSWORD_CODE_URL = () => `/auth/password/reset/verify` //비밀번호 재설정 인증 검증 요청
const RESET_PASSWORD_CHANGE_URL = () => `/auth/password/reset/verify` //비밀번호 입력 후 재설정 요청


export const signinRequest = async(requestBody: SignInRequestDto) : Promise<SignInResponseDto> => {
    return apiClient.post(SIGN_IN_URL(), requestBody)
} //일반 로그인  요청 -> 응답구조 


export const emailCertificationRequest = async (requestBody: EmailCertificationRequestDto) => {
    return apiClient.post(EMAIL_CERTIFICATION_URL(), requestBody)

} //인증번호 전송요청 

export const emailCodeRequest = async (requestBody: EmailCodeRequestDto) => {
    return apiClient.post(EMAIL_CODE_URL(), requestBody)

} //인증번호 검증요청

export const resetPasswordEmailRequest = async (requestBody: ResetPasswordEmailRequestDto) => {
    return apiClient.post(RESET_PASSWORD_EMAIL_URL(), requestBody)
} //비밀번호 찾기 시 이메일 인증번호 요청 

export const resetPasswordCodeRequest = async (requestBody: ResetPasswordCodeRequestDto) => {
    return apiClient.post(RESET_PASSWORD_CODE_URL(), requestBody)
}//비번 찾기 시 이메일 인증번호 검증 요청

export const resetPasswordChangeRequest = async (requestBody: ResetPasswordChangeRequestDto) => {
    return apiClient.put(RESET_PASSWORD_CHANGE_URL(), requestBody)
}//비밀번호 입력 후 재설정 요청 




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