import CartItemRequestDto from "@/apis/user/request/cart/cart-item-request.dto";
import { GetProductListRequestDto } from "@/apis/user/request/product";
import { PRODUCT_PATH } from "@/constant/user/route.index";
import { categoryQueries, productQueries } from "@/querys/user/queryhooks";
import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useCart } from "../cart/use-cart.hook";








//커스텀 훅 : 상품 관련
export const useProduct = () => {

    //서버상태 : 카테고리 트리 
    const {data : categoryTree } = categoryQueries.useCategoryList();

    //커스텀 훅 : 장바구니 추가 
    const {insertMutation} = useCart();

    //상태: 쿼리스트링 훅 사용
    const [searchParams, setSearchParams] = useSearchParams();

    //상태 : 정렬 선택 시 상태 변화 
    const [currentSort , setCurrentSort] = useState<string>("RESENT");

    //상태 : 옵션 선택상태 기록장 
    const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});

    //상태 : 더 보기 클릭 이벤트 처리 
    const [isDescOpen, setIsDescOpen] = useState(false);

    //함수 : 네비게이트 
    const navigate = useNavigate();

    //기본값 설정 page , size(제품 수), 카테고리Id , 검색글자 , 정렬순서  "상품일 경우에.."
    const params = {
        page: searchParams.get("page") || "1",
        size: searchParams.get("size") || "20",
        sort: searchParams.get("sort") || "RECENT",
        ...(searchParams.get("keyword") ? { keyword: searchParams.get("keyword") as string } : {}),
        ...(searchParams.get("categoryId") ? { categoryId: searchParams.get("categoryId") as string } : {}),
        ...(searchParams.get("minPrice") ? { minPrice: searchParams.get("minPrice") as string } : {}),
        ...(searchParams.get("maxPrice") ? { maxPrice: searchParams.get("maxPrice") as string } : {}),
        ...(searchParams.get("minRating") ? { minRating: searchParams.get("minRating") as string } : {}),
        ...(searchParams.get("hasDiscount") ? { hasDiscount: searchParams.get("hasDiscount") as string } : {}),
    }; //sort 의 변수는 최신순 , 가격순(오름차 내림차) , 이름순이 존재 

    //경로 상태 : productId string => number
    const {productId} = useParams();
    const product = Number(productId);

    //서버 상태 : 상세 상품 데이터
    const { data: productDetail } = productQueries.useProductDetail(product);   

    // 2. 옵션 조합 및 SKU 조회 조건 판단 로직
    const optionGroups = productDetail?.optionGroups || [];
    const optionValueIds = Object.values(selectedOptions).sort();
    const isAllSelected = optionGroups.length > 0 && optionGroups.length === optionValueIds.length;

    // 3. SKU 확정 조회 (팩토리 훅 사용)
    const { data: resolvedSku, isFetching: isResolving } = productQueries.useProductSkuResolve(
        product, 
        optionValueIds,
        isAllSelected 
        //마지막 인자로 인해 sku옵션이 완전히 결정이 되었을 경우 요청
    );

    //이벤트핸들러: 옵션 클릭 이벤트 처리
    const optionClickEventhandle = (groupId: number, valueId: number) => {
        setSelectedOptions(prev => ({ ...prev, [groupId]: valueId }));
    };

    //이벤트핸들러: 더보기 이벤트 처리 
    const toggleDesc = () => setIsDescOpen(prev => !prev);

    const updateSearchFilter = (newFilters : Partial<GetProductListRequestDto>) => {
        // nextParams 는 page=1&sort=RESENT 와 같은 객체상태 
        const nextParams = new URLSearchParams(searchParams);

        // cateforyId, keyword , sort 가 변하면 page는 1페이지로 이동한다. 
        if (!newFilters.page) nextParams.set("page", "1");
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value === undefined || value === null || value === "") nextParams.delete(key);
            else nextParams.set(key, String(value));
        }); // searchParams로 쿼리스트링의 개수를 고정 / 수정 / 삭제를 한다. 

        setSearchParams(nextParams); 
        //검색 매개변수 저장한 url 생성
        navigate(PRODUCT_PATH() + `?${nextParams.toString()}`);
        //이동할 쿼리스트링 장소 지정 (누적형태가능)
    }

    //이벤트핸들러 : 상단 카테고리 이동 시 이벤트 처리 
    const HeaderCategoryEventHandler = (categoryId: number | string) => {
        updateSearchFilter({
            categoryId: String(categoryId),
            keyword: "", //검색어 리셋 
            page: "1"
        })
    }


    //이벤트핸들러 : 결과 내 카테고리 이동 (기본 필터 유지 카테고리만 누적변경)
    const SideCategoryEventHandler = (categoryId: number | string) => {
        updateSearchFilter({ categoryId: String(categoryId) });
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


    const handleAddToCart = () => {
        // 1. 모든 옵션이 선택되었는지 먼저 확인
        if (!isAllSelected) {
            alert("모든 옵션을 선택해야 장바구니에 담을 수 있습니다.");
            return;
        }

        //resolvedSku가 확정되었을 때
        if (!resolvedSku || !resolvedSku.skuId) return;
        

        // requestBody에 skuId , quantity 기입 
        const requestBody: CartItemRequestDto = {
            skuId: resolvedSku.skuId, // Resolved된 SKU의 PK
            quantity: 1        // 현재 컴포넌트의 수량 State
        };

        // 장바구니 추가 요청 
        insertMutation.mutate(requestBody, {
            onSuccess: () => {
                if (window.confirm("장바구니에 상품을 담았습니다. 장바구니로 이동하시겠습니까?")) {
                    navigate('/cart');
                }
            }
        });
    };
  
    
    return { 
        params,                 searchParams,              currentSort,
        //초기화 변수           / 쿼리스트링 key=value 형식  /정렬 방식 

        categoryTree,
        //카테고리 변수를 활용.. 

        productDetail,        resolvedSku, isResolving, isDescOpen, selectedOptions,
        //상세보기데이터 , sku 설정 , 설정여부 대기 , 더보기 , 옵션상태 기록

        product,
        //pk 구분자 가져오기 

        updateSearchFilter, 
        // URL 검색누적 필터 

        HeaderCategoryEventHandler,
        //상단 카테고리

        SideCategoryEventHandler,
        //좌측 카테고리

        sortChangeEventHandler,
        //요소 정렬

        resetAllFilters , onPageClickHandler,

        toggleDesc,                 optionClickEventhandle,           
        //더보기 토글 이벤트 처리 /옵션 이벤트 처리

        handleAddToCart
        //장바구니 추가 이벤트 처리 

    };
    
}

//useSearchParams