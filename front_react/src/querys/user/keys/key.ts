import PostListRequestDto from "@/apis/user/request/post/post-list-request.dto";
import { GetProductListRequestDto } from "@/apis/user/request/product";

//key 관리 : user(사용자)
export const userKey = {
    all: ['user'] as const,

    me: () => [...userKey.all, 'me'] as const, // user , me 까지 있어야 의미 oo

    pets: () => [...userKey.all, 'pets'] as const, // user , pets 까지 있어야 의미 oo

    petIds: (petId: number| string) => [...userKey.all, 'pets', petId] as const
    //특정id 수정 삭제 시 필요 
};


//key 관리 : auth(인증)
export const authKey = {
    signIn: ['auth', 'signIn'] as const,
    emailCertification: ['auth', 'emailCertification'] as const,
    emailCode: ['auth', 'emailCode'] as const,
    resetPasswordEmail: ['auth', 'resetPasswordEmail'] as const,
    resetPasswordCode: ['auth', 'resetPasswordCode'] as const,
    resetPasswordChange: ['auth', 'resetPasswordChange'] as const,
};

//key 관리 : category(목록)
export const categoryKeys = {
    all: ['categories'] as const,
    tree: () => [...categoryKeys.all, 'tree'] as const, // => 전체를 조회
    children: (parentId: number | string) => [...categoryKeys.all, 'children', parentId] as const,
}; //children은 parentId 여부에 따른 조회 


//key 관리 : product(상품)
export const productKeys = {
    all: ['products'] as const,
    lists: () => [...productKeys.all, 'list'] as const,
    list: (params: GetProductListRequestDto) => [...productKeys.lists(), params] as const,
    details: () => [...productKeys.all, 'detail'] as const,
    detail: (productId: number) => [...productKeys.details(), productId] as const,
    
    // 상세(detail) 하위에 sku 키를 추가하여 계층 구조 유지
    skus: (productId: number) => [...productKeys.detail(productId), 'skus'] as const,
    sku: (productId: number, optionValueIds: number[]) => 
        [...productKeys.skus(productId), { optionValueIds }] as const,
};

//key 관리 : order(주문)
export const orderKeys = {
    all: ['orders'] as const,
    lists: () => [...orderKeys.all, 'list'] as const,
    details: () => [...orderKeys.all, 'detail'] as const,
    detail: (orderId: number) => [...orderKeys.details(), orderId] as const,
};

//key 관리 : payment(결제)
export const paymentKeys = {
    all: ['payments'] as const,
    details: () => [...paymentKeys.all, 'detail'] as const,
    detail: (orderId: string) => [...paymentKeys.details(), orderId] as const,
};

//key 관리 : point(포인트)
export const pointKeys = {
    all: ['points'] as const,
    lists: () => [...pointKeys.all, 'list'] as const,
    // 포인트 잔액 조회 (me)
    balance: () => [...pointKeys.all, 'me'] as const,
    // 포인트 히스토리 (pagination 포함)
    history: (page: number | null, size: number | null) => 
      [...pointKeys.lists(), { page, size }] as const,
};

//key 관리 : cart(장바구니)
export const cartKeys = {
    all: ['cart'] as const,
    lists: () => [...cartKeys.all, 'list'] as const,
    // 특정 아이템을 식별해야 할 경우 대비 (현재는 전체 조회 위주)
    detail: (id: number) => [...cartKeys.all, 'item', id] as const,
};

//key 관리 : post(게시물)
export const postKeys = {
    all: ['posts'] as const,
    lists: () => [...postKeys.all, 'list'] as const,
    // 검색 조건(params)에 따른 고유 키 생성
    list: (params: PostListRequestDto) => [...postKeys.lists(), params] as const,
    details: () => [...postKeys.all, 'detail'] as const,
    detail: (postId: number) => [...postKeys.details(), postId] as const,
};

//key 관리 : review(댓글)
export const reviewKeys = {
    all: ['reviews'] as const,
    lists: (productId: number) => [...reviewKeys.all, 'list', productId] as const,
    list: (productId: number, page: number, size: number) => 
        [...reviewKeys.lists(productId), { page, size }] as const,
};

//key 관리 : qna(문의)
export const qnaKeys = {
    all: ['qna'] as const,
    // 채팅방 목록
    rooms: () => [...qnaKeys.all, 'rooms'] as const,
    // 특정 채팅방의 메시지들
    messages: (roomId: number) => [...qnaKeys.all, 'messages', roomId] as const,
    // 특정 채팅방의 메시지 (제한 조건 포함)
    messageList: (roomId: number, limit: number) => 
        [...qnaKeys.messages(roomId), { limit }] as const,
};


//key 관리 : banner(배너)
export const bannerKeys = {
    all: ['banners'] as const,
    lists: () => [...bannerKeys.all, 'list'] as const,  
}

//key 관리 : popup(광고)
export const popupKeys = {
  all: ['popups'] as const,
  lists: () => [...popupKeys.all, 'list'] as const,
  list: (filters: string) => [...popupKeys.lists(), { filters }] as const,
  details: () => [...popupKeys.all, 'detail'] as const,
  detail: (id: number) => [...popupKeys.details(), id] as const,
};