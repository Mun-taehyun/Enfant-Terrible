import { useQuery } from '@tanstack/react-query';
import { categoryKeys } from '../keys/key'; 
import { getCategoryChildrenRequest, getCategoryListRequest } from '@/apis/user';



export const categoryQueries = {

    //====================== 전체(대분류, 소분류) 조회 쿼리 ===============
    useCategoryList() {
        return useQuery({
            queryKey: categoryKeys.tree(),
            queryFn: () => getCategoryListRequest(),
            select: (allCategories) => {
                //빈값을 전달 받으면 => 빈 배열을 준다.
                if (!Array.isArray(allCategories)) return { mainList: [], menuTree: [] };
                const activeItems = allCategories.filter(item => item.isActive); //비활성화 카테고리 거름망
                const mainList = activeItems.filter(item => item.depth === 0); //대분류 카테고리...
                // 대분류에 있는 값들 중 활성화 상태를 위주로 일치 여부를 필터.. 
                const menuTree = mainList.map(mainItem => {
                    // 해당 대분류를 부모로 가진 소분류들을 찾음
                    const subItems = activeItems.filter(subItem => subItem.parentId === mainItem.categoryId);
                    return {
                    ...mainItem,
                    // 소분류가 없으면 빈 배열 [] 이 들어감 (대분류 데이터는 그대로 유지됨)
                    subItems: subItems 
                    };
                });
                return { mainList, menuTree };
            }
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


