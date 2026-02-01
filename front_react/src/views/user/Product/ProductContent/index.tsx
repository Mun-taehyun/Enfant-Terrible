import { useProduct } from "@/hooks/user/product/use-product.hook";
import './style.css';


//컴포넌트 : 제품상세이미지 보기
export default function ProductContent() {

    //커스텀 훅
    const {productDetail} = useProduct();

    const toFullImageUrl = (url: string) => {
        if (!url) return "";
        return url.startsWith('http') ? url : new URL(url, window.location.origin).toString();
    };


    if(!productDetail) return;
    return (
        <>
            {/*상세 설명 더보기란*/}
            <div className="detail-content-section expanded">
                <div className="section-divider"><span>상세 정보</span></div>
                
                <div className="image-content-list">
                    {productDetail.contentImageUrls.map((url , index) => (
                        <img key={index} src={toFullImageUrl(url)} alt={`상세 이미지 ${index + 1}`} />
                    ))}
                </div>
            </div>
        </>
    );
}