import { CategoryChildItem } from "@/apis/user/response/category/get-category-children.response.dto";
import { useProduct } from "@/hooks/user/product/use-product.hook";
import { categoryQueries } from "@/querys/user/queryhooks";
import { useState } from "react";
import './style.css'


export default function ProductFilterCard () {

    //커스텀 훅 : 검색변수 , 카테고리이벤트 처리
    const { searchParams , SideCategoryEventHandler } = useProduct();
    const keyword = searchParams.get("keyword");
    const categoryId = Number(searchParams.get("categoryId"))

    //상태 : 소분류를 가져올 부모 Id상태
    const [activeMainId, setActiveMainId] = useState<number|null>(categoryId);

    //서버상태 : 전체 트리 카테고리 
    const {data: categoryList} = categoryQueries.useCategoryList();

    //서버상태 : 소분류 카테고리 
    const {data: categorySmallList} = categoryQueries.useCategoryChildren(activeMainId);


    //이벤트핸들러 : 세부 카테고리 조회 (검색으로 올 시)
    const toggleAccordion = (categoryId : number) => {
        // 이미 열려있으면 닫고, 아니면 해당 ID를 활성화
        setActiveMainId(activeMainId === categoryId ? null : categoryId);
    };

    //렌더 : 상품 필터 
    return(
        <div className="filter-sidebar">
            <div className="filter-title">
                {keyword ? "카테고리 종류" : "세부 카테고리"}
            </div>
            <div className="filter-content">
                {keyword ? 
                    (categoryList?.menuTree.map((category) => ( //대분류 등장 => 토글로 소분류개방
                        <div key={category.categoryId} className="accordion-group">
                        <div className="main-item" onClick={() => toggleAccordion(category.categoryId)}>
                            {category.name} ({category.child.length})
                        </div>
                        {activeMainId === category.categoryId && (
                            <div className="sub-group">
                            {
                            category.child.map((sub : CategoryChildItem) => (
                                <div key={sub.categoryId} className="sub-item" onClick={() => SideCategoryEventHandler('sub.categoryId')}>
                                    {sub.name}
                                </div>
                            ))}
                            </div>
                        )}
                        </div>
                    ))
                    ) : (
                    //소분류만 등장
                    categorySmallList?.childCategories.map((sub : CategoryChildItem) => (
                        <div key={sub.categoryId} className="flat-item" onClick={() => SideCategoryEventHandler('sub.categoryId')}>
                            {sub.name}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

//설계 
//검색할 시 카테고리는 대분류 트리로 존재 
//클릭 시 소분류 등장 