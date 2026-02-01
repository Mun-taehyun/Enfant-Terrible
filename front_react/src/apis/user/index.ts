import type { EmailCertificationRequestDto, EmailCodeRequestDto, ResetPasswordChangeRequestDto, ResetPasswordCodeRequestDto, SignInRequestDto } from "./request/auth";
import apiClient from "..";
import type { GetPopupListResponseDto } from "./response/popup";
import type { SignInResponseDto } from "./response/auth";
import type GetCategoryListResponseDto from "./response/category/get-category-list.response.dto";
import type { PetSelectResponseDto, SignUpResposeDto, UserSelectResponseDto } from "./response/user";
import type { OAuthAddInformationRequestDto, PetAddInsertRequestDto, PetUpdateRequestDto, SignUpRequestDto, UserUpdateRequestDto } from "./request/user";
import type PasswordUpdateRequestDto from "./request/user/password-update.request.dto";
import type ResetPasswordEmailRequestDto from "./request/auth/reset-password-email-request.dto";
import { GetCategoryChildrenResponseDto } from "./response/category";
import {GetProductListResponseDto} from "./response/product";
import {GetProductDetailListResponseDto} from "./response/product";
import { GetProductListRequestDto } from "./request/product";
import GetBannerResponseDto from "./response/banner/get-banner-list.response.dto";
import CartItemRequestDto from "./request/cart/cart-item-request.dto";
import CartItemResponseDto from "./response/cart/cart-item-response.dto";
import PutCartItemRequestDto from "./request/cart/put-cart-item-request.dto";
import { DirectOrderRequestDto, GetOrderParamRequestDto, MyOrderCancelRequestDto } from "./request/order";
import { PaymentCancelRequestDto, PaymentConfirmRequestDto } from "./request/payment";
import { PaymentCancelResponseDto, PaymentConfirmResponseDto } from "./response/payment";
import { PointBalanceResponseDto, PointHistoryResponseDto } from "./response/point";
import { PointChangeRequestDto } from "./request/point";
import PostListRequestDto from "./request/post/post-list-request.dto";
import PostResponseDto from "./response/post/post-response.dto";
import ProductSkuResolveResponse from "./response/product/product-sku-resolve-response.dto";
import { QnaMessageResponseDto, QnaRoomResponseDto } from "./response/qna";
import ProductReviewResponseDto from "./response/review/product-review-response.dto";
import { ProductReviewCreateRequestDto, ProductReviewUpdateRequestDto } from "./request/review";
import type { ProductReviewItem } from "./request/review/product-review-create-request.dto";
import OrderCreateResponseDto from "./response/order/order-create-response.dto";
import OrderFromCartRequestDto from "./request/order/order-from-cart-request.dto";
import { MyOrderCancelResponseDto, MyOrderDetailResponseDto, MyOrderListItemResponseDto, OrderPrepareResponseDto } from "./response/order";
import ProductInquiryResponseDto from "./response/inquiry/product-inquiry-response.dto";
import ProductInquiryRequestDto from "./request/inquiry/product-inquiry-request.dto";



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
export const SNS_SIGN_IN_URL = (type: 'naver'| 'google') => `/oauth2/authorization/${type}`; //소셜로그인 시 로그인 창 접속
const SIGN_UP_URL = () => `/users/signup` //회원가입
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
    return apiClient.post(SIGN_UP_URL(), requestBody)} //회원가입 

export const userSelectRequest = async() :Promise<UserSelectResponseDto> => {
    return apiClient.get(USER_SELECT_URL())} //내 정보 조회 

export const userUpdateRequest = async(requestBody: UserUpdateRequestDto) => {
    return apiClient.put(USER_UPDATE_URL(), requestBody)} //내 정보 수정 

export const passwordUpdateRequest = async (requestBody: PasswordUpdateRequestDto ) => {
    return apiClient.put(PASSWORD_UPDATE_URL(), requestBody)} //비밀번호 변경 요청 

export const userDeleteRequest = async () => {
    return apiClient.delete(USER_DELETE_URL())}//회원탈퇴

export const oauthAddInformationRequest = async (requestBody: OAuthAddInformationRequestDto) => {
    return apiClient.post(OAUTH_ADD_INFORMATION_URL(), requestBody)}//소셜 회원가입 시 추가 정보 입력 요청

export const petAddInsertRequest = async (requestBody: PetAddInsertRequestDto) => {
    return apiClient.post(PET_ADD_INSERT_URL(), requestBody)}//반려동물 등록 요청 

export const petSeleteRequest = async () : Promise<PetSelectResponseDto> => {
    return apiClient.get(PET_SELECT_URL())}//내 반려동물 목록 조회 

export const petUpdateRequest = async ({petId ,requestBody} : {petId: string | number; requestBody : PetUpdateRequestDto} ) => {
    return apiClient.put(PET_UPDATE_URL(petId), requestBody)} //단일인자 매핑 useMutation은 data만 받는다....}//내 반려동물 수정 

export const petDeleteRequest = async (petId : number | string) => {
    return apiClient.delete(PET_DELETE_URL(petId))}//내 반려동물 정보 삭제

//================================= 인증 =================================
const SIGN_IN_URL = () => `/auth/login` 
//로그인
const EMAIL_CERTIFICATION_URL = () => `/auth/email/signup` 
//이메일 인증 메일 요청 
const EMAIL_CODE_URL = () => `/auth/email/verify` 
//이메일 인증번호 검증 요청
const RESET_PASSWORD_EMAIL_URL = () => `/auth/password/reset/request` 
//비밀번호 재설정 이메일요청
const RESET_PASSWORD_CODE_URL = () => `/auth/password/reset/verify` 
//비밀번호 재설정 인증 검증 요청
const RESET_PASSWORD_CHANGE_URL = () => `/auth/password/reset/verify` 
//비밀번호 입력 후 재설정 요청


export const signinRequest = async(requestBody: SignInRequestDto) : Promise<SignInResponseDto> => {
    return apiClient.post(SIGN_IN_URL(), requestBody)} //일반 로그인  요청 -> 응답구조 


export const emailCertificationRequest = async (requestBody: EmailCertificationRequestDto) => {
    return apiClient.post(EMAIL_CERTIFICATION_URL(), requestBody)} //인증번호 전송요청 

export const emailCodeRequest = async (requestBody: EmailCodeRequestDto) => {
    return apiClient.post(EMAIL_CODE_URL(), requestBody)} //인증번호 검증요청

export const resetPasswordEmailRequest = async (requestBody: ResetPasswordEmailRequestDto) => {
    return apiClient.post(RESET_PASSWORD_EMAIL_URL(), requestBody)} 
    //비밀번호 찾기 시 이메일 인증번호 요청 

export const resetPasswordCodeRequest = async (requestBody: ResetPasswordCodeRequestDto) => {
    return apiClient.post(RESET_PASSWORD_CODE_URL(), requestBody)}
    //비번 찾기 시 이메일 인증번호 검증 요청

export const resetPasswordChangeRequest = async (requestBody: ResetPasswordChangeRequestDto) => {
    return apiClient.put(RESET_PASSWORD_CHANGE_URL(), requestBody)}
    //비밀번호 입력 후 재설정 요청 

// ================================ 카테고리 =============================
const GET_CATEGORY_LIST_URL = () => `/categories/tree`;
const GET_CATEGORY_CHILDREN_URL = (parentId : number) => `/categories/children?parentId=${parentId}`;

export const getCategoryListRequest = async () : Promise<GetCategoryListResponseDto> => {
    return apiClient.get(GET_CATEGORY_LIST_URL())};
//카테고리 리스트를 서버에 요청 

export const getCategoryChildrenRequest = async (parentId : number) : Promise<GetCategoryChildrenResponseDto> => {
    return apiClient.get(GET_CATEGORY_CHILDREN_URL(parentId))};
//소분류 카테고리 리스트를 서버에 요청 


// ================================ 상품 =================================
const GET_PRODUCT_LIST_URL = () => `/products`;
//상품 리스트 조회
const GET_PRODUCT_DETAIL_URL = (productId : number) => `/products/${productId}`;
//상품 상세 조회
const GET_PRODUCT_SKU_RESOLVE_URL = (productId : number) => `/products/${productId}/skus/resolve`;
//상품 sku 확정
const GET_PRODUCT_RECOMMENDATION_URL = () => `/products/recommendations`;
//추천 상품 조회 

export const getProductListRequest = async (params : GetProductListRequestDto) : Promise<GetProductListResponseDto> => {
    return apiClient.get(GET_PRODUCT_LIST_URL(), {params})
};

export const getProductDetailRequest = async (productId : number) : Promise<GetProductDetailListResponseDto> => {
    return apiClient.get(GET_PRODUCT_DETAIL_URL(productId))};

export const getProductSkuResolveRequest = async (productId :number , optionValueIds : number[]) : Promise<ProductSkuResolveResponse> => {
    return apiClient.get(GET_PRODUCT_SKU_RESOLVE_URL(productId) , {params: {optionValueIds: optionValueIds.join(',')}});}

export const getProductRecommendationRequest = async () : Promise<GetProductListResponseDto> => {
    return apiClient.get(GET_PRODUCT_RECOMMENDATION_URL());}

// ================================ 주문 ============================
const POST_ORDER_FROM_CART_URL = () => `/orders/from-cart`;
//장바구니에서 주문하기 시.. 
const POST_ORDER_DIRECT_URL = () => `/orders/direct`;
//즉시 구매 주문하기 시..
const GET_ORDER_MY_URL = (page : number , size : number) => `/orders/my?page=${page}&size=${size}`;
//내 주문목록 조회
const GET_ORDER_MY_DETAIL_URL = (orderId : number) => `orders/my/${orderId}`;
//내 주문 상세 조회
const POST_ORDER_MY_CANCEL_URL = (orderId : number) => `orders/my/${orderId}/cancel`;
//내 주문 취소 
const GET_ORDER_PREPARE_FROM_CART_URL = () => `/orders/prepare/from-cart`;
//장바구니 주문 사전조회
const GET_ORDER_PREPARE_DIRECT = () => `/orders/prepare/direct`;
//즉시 주문 사전조회


export const postOrderFromCartRequest = async(requestBody : OrderFromCartRequestDto) : Promise<OrderCreateResponseDto> => {
    return apiClient.post(POST_ORDER_FROM_CART_URL(), requestBody);}

export const postOrderDirectRequest = async(requestBody: DirectOrderRequestDto) : Promise<OrderCreateResponseDto> => {
    return apiClient.post(POST_ORDER_DIRECT_URL(), requestBody);}

export const getOrderMyRequest = async(page:number, size:number) : Promise<MyOrderListItemResponseDto> => {
    return apiClient.get(GET_ORDER_MY_URL(page,size));} 

export const getOrderMyDetailRequest = async(orderId :number) : Promise<MyOrderDetailResponseDto> => {
    return apiClient.get(GET_ORDER_MY_DETAIL_URL(orderId));}

export const postOrderMyCancelRequest = async(orderId : number , requestBody : MyOrderCancelRequestDto) : Promise<MyOrderCancelResponseDto> => {
    return apiClient.post(POST_ORDER_MY_CANCEL_URL(orderId), requestBody);}

export const getOrderPrepareFromCartRequest =async() : Promise<OrderPrepareResponseDto> => {
    return apiClient.get(GET_ORDER_PREPARE_FROM_CART_URL());}

export const getOrderPrepareDirectRequest = async(params : GetOrderParamRequestDto) : Promise<OrderPrepareResponseDto> => {
    const queryParams: any = {
        productId: params.productId,
        quantity: params.quantity,
    };
    if (Array.isArray(params.optionValueIds) && params.optionValueIds.length > 0) {
        queryParams.optionValueIds = params.optionValueIds;
    }
    return apiClient.get(GET_ORDER_PREPARE_DIRECT(), { params: queryParams });}

//================================= 결제 ============================
const POST_PAYMENTS_CONFIRM_URL = () => `/payments/confirm`;
//결제 승인
const POST_PAYMENTS_CANCEL_URL = () => `/payments/cancel`;
//결제 취소 

export const postPaymentsConfirmRequest = async(requestBody : PaymentConfirmRequestDto) : Promise<PaymentConfirmResponseDto> => {
    return apiClient.post(POST_PAYMENTS_CONFIRM_URL(), requestBody);}

export const postPaymentsCancelRequest = async(requestBody : PaymentCancelRequestDto) : Promise<PaymentCancelResponseDto> => {
    return apiClient.post(POST_PAYMENTS_CANCEL_URL(), requestBody);}


//================================ 포인트 ============================
const GET_POINTS_ME_URL = () => `/points/me`;
//포인트 조회하기 
const GET_POINTS_ME_HISTORY_URL = () => `/points/me/history`;
//포인트 히스토리 조회하기  
const POST_POINTS_ME_EARN_URL = () => `/points/me/earn`;
//포인트 적립 하기 
const POST_POINTS_ME_USE_URL = () => `/points/me/use`;
//포인트 사용하기 

export const getPointsMeRequest = () : Promise<PointBalanceResponseDto> => {
    return apiClient.get(GET_POINTS_ME_URL());}
    
export const getPointsMeHistoryRequest = (page?: number | null, size?: number | null) : Promise<PointHistoryResponseDto[]> => {
    return apiClient.get(GET_POINTS_ME_HISTORY_URL(), {
        params: {
            ...(page == null || !Number.isFinite(page) ? {} : { page }),
            ...(size == null || !Number.isFinite(size) ? {} : { size }),
        }
    });}

export const postPointsMeEarnRequest = (requestBody : PointChangeRequestDto) => {
    return apiClient.post(POST_POINTS_ME_EARN_URL(), requestBody);}

export const postPointMeUseRequest = (requestBody : PointChangeRequestDto) => {
    return apiClient.post(POST_POINTS_ME_USE_URL(), requestBody);}



// ================================ 장바구니 ================================
const POST_CART_ITEM_URL = () => `/cart/items`;
//장바구니에 담는 요청 
const GET_CART_ITEM_URL = () => `/cart/items`;
//장바구니 조회
const PUT_CART_ITEM_URL = (cartItemId : number) => `/cart/items/${cartItemId}`;
//장바구니 수량 수정 
const DELETE_CART_ITEM_URL = (cartItemId : number) => `/cart/item/${cartItemId}`;
//장바구니 특정부분 삭제 
const DELETE_CLEAR_CART_ITEM_URL = () => `/cart/items`;
//장바구니 전체삭제 

export const postCartItemRequest = async (requestBody : CartItemRequestDto) => {
    return apiClient.post(POST_CART_ITEM_URL(), requestBody)}

export const getCartItemRequest = async () : Promise<CartItemResponseDto> => {
    return apiClient.get(GET_CART_ITEM_URL());}

export const putCartItemRequest = async ({cartItemId , requestBody} : {cartItemId : number , requestBody : PutCartItemRequestDto }) => {
    return apiClient.put(PUT_CART_ITEM_URL(cartItemId), requestBody);}  

export const deleteCartItemRequest = async(cartItemId : number) => {
    return apiClient.delete(DELETE_CART_ITEM_URL(cartItemId));}

export const deleteClearCartItemRequest = async() => {
    return apiClient.delete(DELETE_CLEAR_CART_ITEM_URL());}



// ===============================   게시물 ===================================
const GET_POSTS_URL = () => `/posts`;
//게시물 목록 조회 
const GET_POSTS_DETAIL_URL = (postId : number) => `/posts/${postId}`;
//게시물 상세 조회

export const getPostRequest = (params : PostListRequestDto) : Promise<PostResponseDto> => {
    return apiClient.get(GET_POSTS_URL(), {params});}

export const getPostDetailRequest = (postId : number) : Promise<PostResponseDto> => {
    return apiClient.get(GET_POSTS_DETAIL_URL(postId))};

// ================================ 리뷰 =======================================
const GET_PRODUCTS_REVIEWS_URL = (productId : number , page : number , size : number) => `/products/${productId}/reviews?page=${page}&size=${size}`
//상품 리뷰 조회 
const GET_MY_REVIEWS_URL = (page : number , size : number) => `/reviews/my?page=${page}&size=${size}`;
//내 리뷰 조회
const POST_PRODUCTS_REVIEWS_URL = (productId : number) => `/products/${productId}/reviews`;
//상품 리뷰 생성 
const PUT_PRODUCTS_REVIEWS_URL = (reviewId : number) => `/reviews/${reviewId}`;
//상품 리뷰 수정
const DELETE_PRODUCTS_REVIEWS_URL = (reviewId : number) => `/reviews/${reviewId}`;
//상품 리뷰 삭제


export const getProductReviewRequest = (productId : number , page : number , size : number) : Promise<ProductReviewResponseDto> => {
    return apiClient.get(GET_PRODUCTS_REVIEWS_URL(productId,page,size));}

export const getMyReviewRequest = (page : number , size : number) : Promise<ProductReviewResponseDto> => {
    return apiClient.get(GET_MY_REVIEWS_URL(page,size));}

function normalizeCreateReviewPayload(requestBody: ProductReviewCreateRequestDto | ProductReviewItem): ProductReviewItem {
    const bodyAny = requestBody as any;
    if (bodyAny && Array.isArray(bodyAny.reviewList) && bodyAny.reviewList.length > 0) {
        return bodyAny.reviewList[0] as ProductReviewItem;
    }
    return requestBody as ProductReviewItem;
}

function buildReviewReqFormData(req: object, images?: File[] | null): FormData {
    const formData = new FormData();
    formData.append(
        'req',
        new Blob([JSON.stringify(req)], { type: 'application/json' })
    );
    if (images && images.length > 0) {
        images.forEach((file) => {
            formData.append('images', file);
        });
    }
    return formData;
}

export const postProductReviewRequest = (
    productId : number,
    requestBody : ProductReviewCreateRequestDto | ProductReviewItem,
    images?: File[] | null
) : Promise<ProductReviewResponseDto> => {
    const payload = normalizeCreateReviewPayload(requestBody);
    const formData = buildReviewReqFormData({
        orderId: payload.orderId,
        rating: payload.rating,
        content: payload.content,
        imageUrls: payload.imageUrls,
    }, images);
    return apiClient.post(POST_PRODUCTS_REVIEWS_URL(productId), formData);}

export const putProductReviewRequest = (reviewId : number, requestBody : ProductReviewUpdateRequestDto, images?: File[] | null ) : Promise<ProductReviewResponseDto> => {
    const formData = buildReviewReqFormData({
        rating: requestBody.rating,
        content: requestBody.content,
        imageUrls: requestBody.imageUrls,
    }, images);
    return apiClient.put(PUT_PRODUCTS_REVIEWS_URL(reviewId), formData);}

export const deleteProductReviewRequest = (reviewId : number) => {
    return apiClient.delete(DELETE_PRODUCTS_REVIEWS_URL(reviewId));}

// ===============================  문의 =================================
const GET_PRODUCT_INQUIRIES_URL = (productId : number, page : number , size: number) => `/products/${productId}/inquiries?page=${page}&size=${size}`
//문의 조회 
const POST_PRODUCT_INQUIRIES_URL = (productId : number) => `/products/${productId}/inquiries`;
//문의 등록
const DELETE_PRODUCT_INQUIRIES_URL = (inquiryId: number) => `/inquiries/${inquiryId}`;
//문의 삭제


export const getProductInquiriesRequest = (productId:number, page:number, size:number) : Promise<ProductInquiryResponseDto> => {
    return apiClient.get(GET_PRODUCT_INQUIRIES_URL(productId,page,size));}

export const postProductInquiriesRequest = (productId:number , requestBody : ProductInquiryRequestDto) : Promise<ProductInquiryResponseDto> => {
    const formData = new FormData();
    formData.append(
        'req',
        new Blob([JSON.stringify(requestBody)], { type: 'application/json' })
    );
    return apiClient.post(POST_PRODUCT_INQUIRIES_URL(productId), formData)}

export const deleteProductInquiriesRequest = (inquiryId:number) => {
    return apiClient.delete(DELETE_PRODUCT_INQUIRIES_URL(inquiryId));}


// ================================ QNA채팅 ================================
const GET_QNA_ROOM_URL = () => `/qna/room`;
//채팅방 조회 
const GET_QNA_MESSAGES_URL = (roomId : number , limit : number) => `/qna/messages?roomId=${roomId}&limit=${limit}`;
//제한된 메세지 조회 

export const getQnaRoomRequest = () : Promise<QnaRoomResponseDto> => {
    return apiClient.get(GET_QNA_ROOM_URL())}

export const getQnaMessageRequest = (roomId : number , limit : number) : Promise<QnaMessageResponseDto> => {
    return apiClient.get(GET_QNA_MESSAGES_URL(roomId,limit))}



//==================================  광고 ===============================
//광고 팝업 리스트 불러오기
const GET_POPUP_LIST_URL = () => `/popups`;

export const getPopupListRequest = async () : Promise<GetPopupListResponseDto> => {
    return apiClient.get(GET_POPUP_LIST_URL());};


//===================================== 배너 ======================================
//배너 리스트 불러오기 
const GET_BANNER_LIST_URL = () => `/banners`

export const getBannerListRequest = async () : Promise<GetBannerResponseDto> => {
    return apiClient.get(GET_BANNER_LIST_URL())
}



//====================================== 파일 ===============================

const FILE_DOMAIN = `/upload`;

export const fileUploadRequest = async (data: FormData) => {
    return apiClient.post(FILE_DOMAIN, data)
}; //백엔드 파일 DB데이터 가져오기 