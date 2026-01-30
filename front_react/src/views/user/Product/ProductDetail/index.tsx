import { TAB_LIST } from "@/constant/user/product.index";
import { useProduct } from "@/hooks/user/product/use-product.hook";
import { useState } from "react";
import ProductContent from "../ProductContent";
import ReviewCard from "../ProductReview";
import { useReview } from "@/hooks/user/review/use-review.hook";
import Pagination from "@/components/user/Pagination";
import InquiryBox from "@/components/user/Inquiry";
import { inquiryQueries } from "@/querys/user/queryhooks/inquiry.query";
import './style.css';







//컴포넌트 : 제품 상세페이지 
export default function ProductDetail() {

    //커스텀 훅: 제품 관련 이벤트 처리 
    const {
            productDetail,
            searchParams,
            product, 
            resolvedSku, 
            isResolving, 
            selectedOptions,  
            optionClickEventhandle, 
            handleAddToCart, //장바구니 추가
        } = useProduct();



    //상태 : 탭에 따른 뷰 변화
    const [activeTab, setActiveTab] = useState<'detail' | 'review' | 'inquiry' | 'delivery'>('detail');
    //상태 : 별점 값 저장 
    const [rating, setRating] = useState("5");

    //커스텀 훅 : 리뷰 데이터 호출
    const {reviewData } = useReview();
    //서버상태 : 문의 
    const {data : inquiryData} = inquiryQueries.useGetInquiries(product, Number(searchParams.get("page")), 5); 


    // 이미지 경로에 서버 주소가 없다면 `${process.env.REACT_APP_API_URL}${imageUrl}` 형태로 수정 필요
    const fullImageUrl = productDetail?.thumbnailUrl && productDetail?.thumbnailUrl.startsWith('http') 
        ? productDetail?.thumbnailUrl
        : productDetail?.thumbnailUrl
            ? `http://localhost:8080${productDetail?.thumbnailUrl}` 
            : ""; 


    if(!productDetail) return;
    //렌더 : 제품 상세페이지
    return (
        <div className="product-detail-page">
            {/* 1. 상단: 구매 정보 섹션 */}
            <div className="product-top-container">
                {/* 왼쪽: 이미지 영역 */}
                <div className="product-visual">
                    <div className="main-image-wrapper">
                        <img src={fullImageUrl} alt={productDetail.name} />
                    </div>
                </div>

                {/* 오른쪽: 구매 옵션 영역 */}
                <div className="product-buy-config">
                    <div className="header-info">
                        <div className="category-tag">{productDetail.categoryName}</div>
                        <h1 className="product-title">{productDetail.name}</h1>
                        <div className="rating-summary">
                            <span className="star">⭐ {productDetail.averageRating}</span>
                            <span className="count">({productDetail.reviewCount}개 리뷰)</span>
                        </div>
                    </div>

                    <div className="price-info">
                        {/* SKU 확정 전엔 대표 가격, 확정 후엔 SKU 가격 표시 */}
                        <div className="price-row">
                            <span className="discount-percent">{productDetail.discountValue}%</span>
                            <span className="final-price">
                                {isResolving ? "확인 중..." : 
                                 (resolvedSku?.price ?? productDetail?.skus?.[0]?.discountedPrice ?? 0).toLocaleString()}원
                            </span>
                        </div>
                    </div>

                    {/* 옵션 선택창 */}
                    <div className="option-selection-area">
                        {productDetail.optionGroups.map(group => (//option 그룹 모둠.. 
                            <div key={group.optionGroupId} className="option-group">
                                <div className="group-label">{group.name}</div>
                                <div className="value-grid">
                                    {group.values.map(value => (// 그 그룹에 대한 값.. 
                                        <div key={value.optionValueId}
                                            className={`value-card ${selectedOptions[group.optionGroupId] === value.optionValueId ? 'active' : ''}`}
                                            onClick={() => optionClickEventhandle(group.optionGroupId, value.optionValueId)}
                                        >
                                            {value.value}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 선택 완료 시 나타나는 SKU 상태바 */}
                    {resolvedSku && (//선택이 되었을 경우 sku 요청 
                        <div className={`sku-status-bar ${resolvedSku.status}`}>
                            {resolvedSku.status === 'SOLD_OUT' 
                                ? "현재 선택하신 옵션은 품절입니다." 
                                : `재고가 ${resolvedSku.stock}개 남았습니다.`}
                        </div>
                    )}

                    <div className="sticky-action-buttons">
                        <div className="cart-action" onClick={handleAddToCart}>장바구니</div>
                        <div className={`buy-now-action ${(!resolvedSku || resolvedSku.status === 'SOLD_OUT') ? 'disabled' : ''}`}>
                            {resolvedSku?.status === 'SOLD_OUT' ? '구매 불가' : '바로 구매하기'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="product-tab-container">
                {TAB_LIST.map(tab => (
                    <div
                        key={tab.key}
                        className={`product-tab-item ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key as 'detail' | 'review' | 'inquiry' | 'delivery')}
                    >
                        {tab.label}
                    </div>
                ))}
            </div>
            <div className="product-tab-content">
                {activeTab === 'detail' && <ProductContent />}
                {activeTab === 'review' && (
                    <div id="review-container">
                        {/* 별점 영역: input 태그는 반드시 /> 로 닫아야 함 */}
                        <div className="rating-group">
                            {[5, 4, 3, 2, 1].map((num) => (//값에 따른 변수 변동 => 작성 , 수정 시 사용
                                <label key={num} htmlFor={`s${num}`}>
                                <input type="radio" name="rating" value={num} id={`s${num}`} checked={rating === String(num)}
                                    onChange={(e) => setRating(e.target.value)}
                                />★</label>
                            ))}
                        </div>
                        <div className="content-group">
                            <textarea id="reviewText" placeholder="내용을 입력하세요"></textarea>
                        </div>

                        <div className="button-group">
                            <button type="button" id="btn-save">등록하기</button>
                            {/* style 속성은 객체 형태로 전달 */}
                            <button type="button" id="btn-update" style={{ display: 'none' }}>수정완료</button>
                            <button type="button" id="btn-cancel" style={{ display: 'none' }}>취소</button>
                        </div>

                        
                        {reviewData ? reviewData?.reviewList.map((item) => (//리뷰 목록 렌더링
                            <ReviewCard key={item.reviewId} props={item} />
                        )) : "리뷰가 존재하지 않습니다"
                        }
                        <div className="pagination-review">
                            <Pagination totalCount={reviewData?.reviewList.length} size={5}/>
                        </div>
                    </div>
                )}
                {activeTab === 'inquiry' && ( //문의데이터가 있을 경우에 ... 
                    inquiryData ? inquiryData.inquiryList.map( (item) => (<InquiryBox item={item} />)):
                    <div> 문의 내역이 존재하지 않습니다. </div>
                )}
            </div>
        </div>
    );
}