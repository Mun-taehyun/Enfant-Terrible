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
    // 검색 조건(params)에 따라 각각 다른 캐시를 생성하도록 설정
    list: (params: GetProductListRequestDto) => [...productKeys.lists(), params] as const,
    details: () => [...productKeys.all, 'detail'] as const,
    detail: (productId: number) => [...productKeys.details(), productId] as const,
};