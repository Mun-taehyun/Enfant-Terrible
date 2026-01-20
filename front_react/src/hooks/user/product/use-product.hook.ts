import { GetProductListRequestDto } from "@/apis/user/request/product";
import { PRODUCT_PATH } from "@/constant/user/route.index";
import { categoryQueries } from "@/querys/user/queryhooks";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";





//커스텀 훅 : 상품 관련
export const useProduct = () => {

    //서버상태 : 카테고리 트리 
    const {data : categoryTree } = categoryQueries.useCategoryList();

    //상태: 쿼리스트링 훅 사용
    const [searchParams, setSearchParams] = useSearchParams();

    //상태 : 정렬 선택 시 상태 변화 
    const [currentSort , setCurrentSort] = useState<string>("RESENT");

    //함수 : 네비게이트 
    const navigate = useNavigate();

    //기본값 설정 page , size(제품 수), 카테고리Id , 검색글자 , 정렬순서 
    const params = {
        page: searchParams.get("page") || "1",       
        size: searchParams.get("size") || "20",       
        sort: searchParams.get("sort") || "RESENT",
        keyword: searchParams.get("keyword") || "",
        categoryId: searchParams.get("categoryId") || "",
    }; //sort 의 변수는 최신순 , 가격순(오름차 내림차) , 이름순이 존재 


    const updateSearchFilter = (newFilters : Partial<GetProductListRequestDto>) => {
        // nextParams 는 page=1&sort=RESENT 와 같은 객체상태 
        const nextParams = new URLSearchParams(searchParams);

        // cateforyId, keyword , sort 가 변하면 page는 1페이지로 이동한다. 
        if (!newFilters.page) nextParams.set("page", "1");
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value) nextParams.set(key, String(value));  
            else nextParams.delete(key);   
        }); // searchParams로 쿼리스트링의 개수를 고정 / 수정 / 삭제를 한다. 

        setSearchParams(nextParams); 
        //검색 매개변수 저장한 url 생성
        navigate(PRODUCT_PATH() + `?${nextParams.toString()}`);
        //이동할 쿼리스트링 장소 지정 (누적형태가능)
    }

    //이벤트핸들러 : 상단 카테고리 이동 시 이벤트 처리 
    const HeaderCategoryEventHandler = (categoryId: string) => {
        updateSearchFilter({
            categoryId,
            keyword: "", //검색어 리셋 
            page: "1"
        })
    }


    //이벤트핸들러 : 결과 내 카테고리 이동 (기본 필터 유지 카테고리만 누적변경)
    const SideCategoryEventHandler = (categoryId: string) => {
        updateSearchFilter({ categoryId });
    };


    //이벤트핸들러 : 페이지이동 시 Url 변경 , navigate 이동
    const onPageClickHandler = (page: number) => {
        updateSearchFilter({ page: String(page) });
    };

    //이벤트핸들러 : 기존 URL 방식을 모두 초기화
    //page ,search , category , sort 등 기본값
    const resetAllFilters = () => {
        setSearchParams(params); 
    };

    //이벤트핸들러 : 정렬 이벤트 처리 
    const sortChangeEventHandler = (sortValue : string) => {
        setCurrentSort(sortValue); // 이 호출 하나로 useQuery가 다시 실행됨
    };
  
    
    return { 
        params,                 searchParams,              currentSort,
        //초기화 변수           / 쿼리스트링 key=value 형식  /정렬 방식 

        categoryTree,
        //카테고리 변수를 활용.. 
        updateSearchFilter, 
        // URL 검색누적 필터 

        HeaderCategoryEventHandler,
        //상단 카테고리

        SideCategoryEventHandler,
        //좌측 카테고리

        sortChangeEventHandler,
        //요소 정렬

        resetAllFilters , onPageClickHandler
    };
    
}

//useSearchParams