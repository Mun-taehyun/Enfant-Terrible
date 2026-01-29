import { useQuery } from '@tanstack/react-query';
import { categoryKeys } from '../keys/key'; 
import { getCategoryChildrenRequest, getCategoryListRequest } from '@/apis/user';
import { CategoryChildItem } from '@/apis/user/response/category/get-category-children.response.dto';



export const categoryQueries = {

    //====================== 전체(대분류, 소분류) 조회 쿼리 ===============
    useCategoryList() {
        return useQuery({
            queryKey: categoryKeys.tree(),
            queryFn: () => getCategoryListRequest(),
            select: (allCategories) => {
                //빈 배열 시 반환 


                const list = Array.isArray(allCategories) ? allCategories : [];
                //대분류에 대응하는 소분류 반환 
                console.log(list);

                if (list.length === 0 ) return {mainList : [], menuTree: []};
                const menuTree = list
                    .filter(item => item.status === "ACTIVE" || item.status === null )
                    .map(mainItem => ({
                    ...mainItem,
                    //대분류의 child로 => 소분류 리스트 받아온다.. 
                    children :mainItem.children
                        ? mainItem.children.filter((sub : CategoryChildItem) => sub.status === "ACTIVE" || sub.status === null)
                        : []
                    }));
                        
                        console.log("최종 데이터:" , menuTree);


                //대분류 반환 => child 제외 
                const mainList = menuTree.map(item => //Object.entries(item) => key: value 를 [key,value] 로만든다. 
                    {return Object.fromEntries(Object.entries(item).filter(([key]) => key !== 'children'));});

                return { mainList, menuTree};
            }
        });
    },    

    // ===================== 소분류 카테고리 조회 쿼리 ==========
    useCategoryChildren(parentId: number | null) {
        return useQuery({
            queryKey: categoryKeys.children(parentId!),
            queryFn: () => getCategoryChildrenRequest(parentId!),
            enabled: !!parentId, // parentId가 존재할 때만 API 호출
        });
    },
}


