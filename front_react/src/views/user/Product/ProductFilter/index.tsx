import Pagination from "@/components/user/Pagination";
import ProductCard from "@/components/user/Product/Item";
import { SORT_OPTIONS } from "@/constant/user/sort.index";
import { useProduct } from "@/hooks/user/product/use-product.hook";
import { productQueries } from "@/querys/user/queryhooks";





// 컴포넌트 : 제품 필터결과 화면 
export default function ProductFilter() {

    // 커스텀 훅 : 검색 누적 형식으로 필터 적용 
    const {
        params,                         sortChangeEventHandler                     
        //url 의 key=value 가공데이터   /정렬을 위한 이벤트 처리 
    } = useProduct();

    //서버상태 : 상품 리스트  => key값 변화 감지 "호출"
    const {data : productData } = productQueries.useProductList(params);

    // 렌더 : 카테고리제품
    return(
        <div className="layout-container">        
            <div className="filter-sidebar">
                {/* 좌측 영역: 필터 */}
            </div>
            <div className="content-area">
                <div className="content-header">
                    <div className="total-info">
                        <div className="total-label">총</div>
                        <div className="total-count">{productData?.length || 0}</div>
                        <div className="total-unit">개 상품</div>
                    </div>    
                    <div className="sort-group">
                        {SORT_OPTIONS.map((option) => (
                            <div
                            key={option.value}
                            className={`sort-item ${params.sort === option.value ? "is-active" : ""}`}
                            onClick={() => sortChangeEventHandler(option.value)}
                            >
                            {option.label}
                            </div>
                        ))}
                    </div>
                </div>    
                {/* 우측 상단: 상품 그리드 (4열 5행 자동 생성) */}
                <div className="product-grid">
                    {productData?.map((item) => (<ProductCard key={item.productId} product={item} />))}
                </div>  
                <div className="pagination-wrapper">
                    <Pagination totalCount={productData?.length} />
                </div>
            </div>
        </div>
    );
}