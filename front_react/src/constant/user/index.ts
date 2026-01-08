export const MAIN_PATH = () => '/';
//메인페이지 
export const AUTH_PATH = () => '/auth';
//인증페이지 


//소셜 

export const USER_PATH = () => `/user`;
//마이페이지 
export const USER_UPDATE_PATH = (userId: number | string) => `/user/${userId}`;
//마이페이지 수정

export const PRODUCT_PATH = () => `/product`; //기준이 되는 리소스

export const PRODUCT_CATEGORY_PATH = (categoryId: number | string) => `/product/${categoryId}`;
//카테고리 제품페이지
export const PRODUCT_SEARCH_PATH = (searchWord: string) => `/product/${searchWord}`;
//제품 검색페이지 
export const PRODUCT_DETAIL_PATH = (productId: number | string) => `/product/${productId}`;
//제품 상세페이지 


export const CART_PATH = (userId: number | string) => `/cart/${userId}`;
// 장바구니 페이지 
// 추가 삭제 가능함 

export const ORDER_PATH = (userId: number | string) => `/order/${userId}`;
//주문 페이지 

export const CHAT_PATH = (roomId: number | string) => `/chat/room/${roomId}`
//채팅 룸 페이지 
