import { useProduct } from "@/hooks/user/product/use-product.hook";


//컴포넌트 : 제품상세이미지 보기
export default function ProductContent() {

    //커스텀 훅
    const {productDetail, isDescOpen,toggleDesc} = useProduct();


    if(!productDetail) return;
    return (
        <>
            {/*상세 설명 더보기란*/}
            <div className={`detail-content-section ${isDescOpen ? 'expanded' : 'collapsed'}`}>
                <div className="section-divider"><span>상세 정보</span></div>
                
                <div className="image-content-list">
                    {productDetail.contentImageUrls.map((url, index) => (
                        <img key={index} src={url} alt={`상세 이미지 ${index + 1}`} />
                    ))}
                    {/* 더보기 버튼 오버레이 (CSS에서 그라데이션 처리) */}
                    {!isDescOpen && <div className="fade-overlay" />}
                </div>

                <div className="toggle-button-wrapper" onClick={toggleDesc}>
                    <div className="toggle-btn">
                        {isDescOpen ? "상세정보 접기 ▲" : "상세정보 펼쳐보기 ▼"}
                    </div>
                </div>
            </div>
        </>
    );
}