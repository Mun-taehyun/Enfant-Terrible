import { CategoryChildItem } from "@/apis/user/response/category/get-category-children.response.dto";
import { useProduct } from "@/hooks/user/product/use-product.hook";
import { categoryQueries } from "@/querys/user/queryhooks";
import { useState } from "react";
import './style.css'


export default function ProductFilterCard () {

    //커스텀 훅 : 카테고리이벤트 처리
    const { SideCategoryEventHandler } = useProduct();

    //상태 : 열려있는 대분류
    const [activeMainId, setActiveMainId] = useState<number | null>(null);

    //서버상태 : 전체 트리 카테고리 
    const {data: categoryList} = categoryQueries.useCategoryList();

    const onClickMainCategory = (categoryId: number) => {
        setActiveMainId((prev) => (prev === categoryId ? null : categoryId));
        SideCategoryEventHandler(categoryId);
    };

    //렌더 : 상품 필터 
    return(
        <div className="filter-sidebar">
            <div className="filter-title">
                {"카테고리"}
            </div>
            <div className="filter-content">
                {(categoryList?.menuTree ?? []).map((category) => (
                    <div key={category.categoryId} className="accordion-group">
                        <div className="main-item" onClick={() => onClickMainCategory(category.categoryId)}>
                            {category.name} ({(category.children ?? []).length})
                        </div>
                        {activeMainId === category.categoryId && (
                            <div className="sub-group">
                                {(category.children ?? []).map((sub : CategoryChildItem) => (
                                    <div key={sub.categoryId} className="sub-item" onClick={() => SideCategoryEventHandler(sub.categoryId)}>
                                        {sub.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

//설계 
//검색할 시 카테고리는 대분류 트리로 존재 
//클릭 시 소분류 등장