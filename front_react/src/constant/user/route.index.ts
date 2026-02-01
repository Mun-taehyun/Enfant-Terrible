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
export const OAUTH_PATH = () => `/oauth/callback`;
//소셜 리 다이렉트 페이지 



    //      메인 페이지 /         d
    //      인증 페이지 /auth     d
    //      로그인/회원/비번바꾸기 페이지 /auth/login       d
    //      소셜 회원가입 추가 페이지 /auth/oauth           d
    //      펫정보 추가 페이지 /auth/add-infomation         d
    //      소셜 리다이렉트 /http://localhost:3000/oauth/callback

export const USER_PATH = () => `/user`;
//마이페이지 
export const USER_UPDATE_PATH = (userId: number | string) => `/${userId}`;
//마이페이지 수정


    //      유저 마이페이지 /user           d
    //      유저 수정페이지 /user/:userId     d


export const PRODUCT_PATH = () => `/product`; 
//제품 필터된 정보 페이지 "쿼리스트링 방식은 별도로 적용"
export const PRODUCT_DETAIL_PATH = (productId: number | string) => `/${productId}`;
//제품 상세페이지 


    //      제품 필터페이지 /product    ... 쿼리스트링 방식으로 생략해두고 이동   d
    //      제품 상세페이지 /product/:productId     d


export const CART_PATH = () => `/cart`;

    //      장바구니페이지 /cart

export const ORDER_PATH = () => `/order`;
export const ORDER_DETAIL_PATH = (orderId : number | string) => `/${orderId}`;
export const ORDER_PAYLOAD_PATH = () => `/payload`;
export const ORDER_COMPLETE_PATH = () => `/complete`;
//주문 페이지 /order
    //      주문 상세페이지 /order/:orderId     
    //      결제 준비페이지 /order/payload 

export const POINT_PATH = () => `/point`;
    //      포인트 히스토리페이지 /point  
    
export const POST_PATH = () => `/post`;
export const POST_DETAIL_PATH = (postId : number|string) => `/${postId}`;



export const CHAT_PATH = (roomId: number | string) => `/chat/room/${roomId}`
//채팅 룸 페이지 




    //컴포넌트 렌더링 설계
    //      메인 페이지 /         d
    //      인증 페이지 /auth     d
    //      로그인/회원/비번바꾸기 페이지 /auth/login       d
    //      소셜 회원가입 추가 페이지 /auth/oauth           d
    //      펫정보 추가 페이지 /auth/add-infomation         d
    //      소셜 리다이렉트 /http://localhost:3000/oauth/callback

    //      유저 마이페이지 /user           d
    //      유저 수정페이지 /user/:userId     d

    //      제품 필터페이지 /product    ... 쿼리스트링 방식으로 생략해두고 이동   d
    //      제품 상세페이지 /product/:productId     d

    //      공지 목록페이지 /post       
    //      공지 상세페이지 /post/:postId       


    //      주문페이지      /order
    //      주문 상세페이지 /order/:orderId     
    //      결제 준비페이지 /order/payload      

    //      포인트 히스토리페이지 /point      

    //      장바구니페이지 /cart 
