import { useQuery } from '@tanstack/react-query';
import { categoryKeys } from '../keys/key'; 
import { getCategoryChildrenRequest, getCategoryListRequest } from '@/apis/user';



export const categoryQueries = {

    //====================== 전체(대분류, 소분류) 조회 쿼리 ===============
    useCategoryList() {
        return useQuery({
            queryKey: categoryKeys.tree(),
            queryFn: () => getCategoryListRequest(),
        });
    },    

    // ===================== 소분류 카테고리 조회 쿼리 ==========
    useCategoryChildren(parentId: number | string) {
        return useQuery({
            queryKey: categoryKeys.children(parentId),
            queryFn: () => getCategoryChildrenRequest(parentId),
            enabled: !!parentId, // parentId가 존재할 때만 API 호출
        });
    },
}


