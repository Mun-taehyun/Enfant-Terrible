import type {Product} from "@/types/user/interface"


export default interface GetProductListResponseDto {
    productList : Product[];
}
//필터링 된 제품 리스트를 반환 받는다.