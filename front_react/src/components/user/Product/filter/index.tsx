import { useProduct } from "@/hooks/user/product/use-product.hook";
import { categoryQueries } from "@/querys/user/queryhooks";



export default function ProductFilterCard () {

    //커스텀 훅 : 검색변수 , 카테고리이벤트 처리
    const { searchParams , params , HeaderCategoryEventHandler } = useProduct();
    
    const keyword = searchParams.get("keyword");

    const categoryId = searchParams.get("category");

    //서버상태 : 전체 트리 카테고리 
    const {data: categoryList} = categoryQueries.useCategoryList();

    //서버상태 : 소분류 카테고리 
    const {data: categorySmallList} = categoryQueries.useCategoryChildren();


    //렌더 : 상품 필터 
    return(
        <div className="filter-sidebar">
            <div className="filter-title">
                {keyword ? "카테고리 종류" : "세부 카테고리"}
            </div>
            <div className="filter-content">
                {keyword ? 
                    (categoryList?.map(category => (
                        <div key={category.categoryId} className="accordion-group">
                        <div className="main-item" onClick={() => toggleAccordion(category.categoryId)}>
                            {category.name} ({category.count})
                        </div>
                        {openId === category.categoryId && (
                            <div className="sub-group">
                            {category.subCategories.map(sub => (
                                <div key={sub.id} className="sub-item" onClick={() => onCategoryClick(sub.id)}>
                                {sub.name} ({sub.count})
                                </div>
                            ))}
                            </div>
                        )}
                        </div>
                    ))
                    ) : (
                    // [카테고리 모드] 소분류가 주르륵 나열되는 리스트 구조
                    categorySmallList?.map(sub => (
                        <div key={sub.categoryId} className="flat-item" onClick={() => onCategoryClick(subCat.id)}>
                        {subCat.name}
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