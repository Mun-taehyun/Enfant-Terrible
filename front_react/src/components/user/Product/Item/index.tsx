import Product from "@/types/user/interface/product.interface";


interface Props {
    props : Product;
}

//컴포넌트 : 제품
export default function ProductCard({ props }: Props) {

    //속성 : 제품
    const { categoryName, name, description, price, thumbnailUrl} = props;


    //렌더 : 제품
    return (
        <div className="product-card">
            <div className="product-image-wrapper">
                <img src={thumbnailUrl} alt={name} className="product-image"/>
            </div>
            <div className="product-info">
                <div className="product-category"> {categoryName}</div>
                <div className="product-title">{name}</div>
                <div className="product-description">{description}</div>
                <div className="product-price">{price}원</div>
            </div>
        </div>
    );
}