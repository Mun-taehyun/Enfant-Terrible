
import ProductCard from "@/components/user/Product/Item";
import './style.css';
import { bannerQueries, productQueries } from "@/querys/user/queryhooks";
import BannerMain from "@/components/user/Banner/BannerMain";




//컴포넌트 : 메인화면  => 광고배너 / 상품추천 리스트 

// => useQuery 로 두개 가져와야 한다.
export default function Main() {

    //서버상태 : 상품 리스트  => key값 변화 감지 "호출"
    const {data : productData } = productQueries.useProductRecommendation();
    //서버상태 : 배너 리스트 
    const {data : bannerData} = bannerQueries.useBannerList();


    return (
        <div className="main-page">
            <div className="main-banner-container">
                {bannerData?.bannerList ?
                    <BannerMain banners={bannerData?.bannerList} />
                    :
                    <div className="main-banner-exist"> 현재 배너가 존재하지 않습니다. </div>
                } 
            </div>
            <div className="main-recommend-product-container">
                {productData?.map((item) => (<ProductCard key={item.productId} product={item} />))}
            </div>
            <div className="main-chat-container">
                <div className="chat-floating-button">
                💬
                </div>
            </div>
        </div>
    );
}

// 구조 
// 상단 배너
// 중단 상품
// 하단 채팅 아이콘 


// useQuery 의 데이터로 => " 클라이언트에 데이터를 주입받는다 "