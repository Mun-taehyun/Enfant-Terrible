export const MAIN_PATH = () => '/';
//메인페이지 
export const AUTH_PATH = () => '/auth';
//인증페이지 
export const AUTH_LOGIN_PATH = () => `/login`;
//로그인, 회원가입 , 비밀번호 변경 페이지 
export const AUTH_OAUTH_PATH = () => `/oauth`;
//소셜회원가입 추가정보 입력 페이지 
export const AUTH_ADD_INFOMATION_PATH = () => `/add-infomation`;
//추가 정보 입력 페이지
export const OAUTH_PATH = (accessToken : string) => `/oauth/callback/${accessToken}`;
//소셜 리 다이렉트 페이지 

export const USER_PATH = () => `/user`;
//마이페이지 
export const USER_UPDATE_PATH = (userId: number | string) => `${userId}`;
//마이페이지 수정

export const PRODUCT_PATH = () => `/product`; 
//제품 필터된 정보 페이지 "쿼리스트링 방식은 별도로 적용"
export const PRODUCT_DETAIL_PATH = (productId: number | string) => `/product/${productId}`;
//제품 상세페이지 


export const CART_PATH = (userId: number | string) => `/cart/${userId}`;
// 장바구니 페이지 
// 추가 삭제 가능함 

export const ORDER_PATH = (userId: number | string) => `/order/${userId}`;
//주문 페이지 

export const CHAT_PATH = (roomId: number | string) => `/chat/room/${roomId}`
//채팅 룸 페이지 
