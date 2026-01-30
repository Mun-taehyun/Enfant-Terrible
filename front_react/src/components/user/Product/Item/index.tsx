import Product from "@/types/user/interface/product.interface";
import './style.css';



// 현재 discountType 은 변동사항이 존재함 명시 .
interface Props {
    product : Product;
    onClick : (id : number) => void;
}

//컴포넌트 : 제품
export default function ProductCard({ product , onClick }: Props) {

    //속성 : 제품
    const { categoryName, name, description, price, thumbnailUrl,
            discountType, discountValue, discountedPrice, averageRating, reviewCount,productId
    } = product;

    const fullImageUrl = thumbnailUrl.startsWith('http') ? thumbnailUrl : `http://localhost:8080${thumbnailUrl}`;


    //렌더 : 제품
    return (
        <div className="product-card" onClick={() =>onClick( productId )}>
            {/* 상단: 이미지 및 배지 영역 */}
            <div className="product-image-container">
                <img src={fullImageUrl} alt={name} className="product-image" />
                {discountValue > 0 && (//할인이 퍼센트인지 그냥 값인지에 따른 할인 반영
                    <div className="product-badge">
                        {discountType === 'PERCENT' ? `${discountValue}%` : 'SALE'}
                    </div>
                )}
            </div>

            {/* 하단: 상품 상세 정보 영역 */}
            <div className="product-info-container">
                <div className="product-category">{categoryName}</div>
                <div className="product-name">{name}</div>
                <div className="product-description">{description}</div>
                
                {/* 가격 정보: 할인이 있을 때만 원가 노출 */}
                <div className="product-price-box">
                    <div className="display-price">{discountedPrice.toLocaleString()}원</div>
                    {discountValue > 0 && ( //toLocaleString 39000 => 39.000이렇게 출력시킴 .
                        <div className="origin-price">{price.toLocaleString()}원</div>
                    )}
                </div>

                {/* 메타 정보: 평점 및 리뷰 */}
                <div className="product-meta">
                    <div className="rating-star">★</div>
                    <div className="rating-score">{averageRating}</div>
                    <div className="review-count">({reviewCount})</div>
                </div>
            </div>
        </div>
    );
}
