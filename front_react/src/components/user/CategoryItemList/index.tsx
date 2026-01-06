import { getCategoryListRequest, getPopupListRequest } from '@/apis/user';
import type GetCategoryListResponseDto from '@/apis/user/response/category/get-category-list.response.dto';
import type { CategoryItem } from '@/types/user/interface';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';



//컴포넌트 : 카테고리 리스트 
export default function CategoryItemList(){


    //쿼리 : API에 응답된 결과 받아오기 
    const {data , error , isLoading} = useQuery<GetCategoryListResponseDto>(
        { 
        queryKey: ['category'] , 
        queryFn: getCategoryListRequest
        } // GetPopupListResponseDto 에 있는 isActive : true 일 경우에 받아온다. 
    );
    if (isLoading) return <div> 카테고리 업로드 중 </div>
    if (error instanceof Error) return <div>{error.message}</div>;

    //상태 : 대분류 카테고리 클릭 상태 
    const [categoryStatus, setCategoryStatus] = useState<boolean>(false);

    //상태 : 대분류 카테고리 배열 상태 
    const [categoryLargeList, setCategoryLargeList] = useState<CategoryItem[]>([]);

    //상태 : 소분류 카테고리 배열 상태 
    const [categorySmallList, setCategorySmallList] = useState<CategoryItem[]>([]); 

    //이벤트핸들러 : 카테고리 클릭 이벤트 처리 
    const categoryClickEventHandler = () => {
        // 1. 클릭 시 소분류 카테고리 클릭 상태  => 다시 또 누르면 소분류 카테고리가 사라짐 
        setCategoryStatus(!categoryStatus); // true => false , false => true
    }


    //효과 : 카테고리 데이터를 서버에서 가져온 것을 기반으로 분류처리 
    useEffect(() => {
        if(!data) return;
        for(let i = 0; data.categoryListItem.length; i++ ){
            //부모 id == 0일 경우에 => 대분류 리스트에 넣고 
            if(data.categoryListItem[i].parentId !== null){
                const categoryLarge = data.categoryListItem.filter(item => item.depth === 0);
                //categoryLarge 요소가 여러개 담겨져 있음 . => sortOrder로 sort()
                categoryLarge.sort((a, b) => b.sortOrder - a.sortOrder); // sort시 구분자가 필요 
                setCategoryLargeList(categoryLarge);
            }
            const categorySmall = data.categoryListItem.filter(item => item.depth === 1);
            //categorySmall 요소가 여러개 담겨져 있음 . => sortOrder로 sort()
            categorySmall.sort((a, b) => b.sortOrder - a.sortOrder); // sort시 구분자가 필요 
            setCategorySmallList(categorySmall);
            //부모 id 가 없을 경우에 => 소분류 리스트에 넣고 
        } 
    }, [])




    return (
        <>
        {categoryStatus ?
        <div onClick={categoryClickEventHandler}> 
            {categoryLargeList.map((item) => <CategoryItem categoryItem={item} />) } 
        </div>
        
        :
        
        
        }
        </>
    );

}