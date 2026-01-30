
import ProductCard from "@/components/user/Product/Item";
import './style.css';
import { bannerQueries, productQueries } from "@/querys/user/queryhooks";
import BannerMain from "@/components/user/Banner/BannerMain";
import { Product } from "@/types/user/interface";
import { PRODUCT_DETAIL_PATH, PRODUCT_PATH } from "@/constant/user/route.index";
import { useNavigate } from "react-router-dom";
import { useProduct } from "@/hooks/user/product/use-product.hook";
import Pagination from "@/components/user/Pagination";
import { useState } from "react";
import ChatQna from "../Chat";





//컴포넌트 : 메인화면  => 광고배너 / 상품추천 리스트 

// => useQuery 로 두개 가져와야 한다.
export default function Main() {

    //서버상태 : 상품 리스트  => key값 변화 감지 "호출"
    const {data : productData } = productQueries.useProductRecommendation();
    //서버상태 : 배너 리스트 
    const {data : bannerData} = bannerQueries.useBannerList();

    //전체리스트를 10개씩 나눠서.. 
    const { searchParams } = useProduct();
    const params = {
        page: Number( searchParams.get("page") ) || 1,
        size: 10,
        sort: searchParams.get("sort") || "RECENT"
    }
    //서버상태 : 전체상품 리스트 
    const {data : productListData} = productQueries.useProductList(params);

    const [chatButton , setChatButton] = useState<boolean>(false);


    //함수:네비
    const navigate = useNavigate();

    const onClickProductDetailEventHandler = (product : number) => {
        console.log("상세보기테스트");
        navigate(PRODUCT_PATH() + "/" + PRODUCT_DETAIL_PATH(product))
    }

    const onClickChatButtonClickToggle = () => {
        setChatButton(!chatButton);
    }


    return (
        <div className="main-page">
            <div className="main-banner-container">
                {bannerData ?
                    <BannerMain banners={bannerData.bannerList} />
                    :
                    <div className="empty-message"> 현재 배너가 존재하지 않습니다. </div>
                } 
            </div>
            <div className="section-container">
                <h2 className="section-title">추천 상품</h2>
                <div className="main-recommend-product-container">
                    {productData && productData.productList ? ( 
                        productData.productList?.map((item : Product) => (<ProductCard key={item.productId} product={item} onClick={() => onClickProductDetailEventHandler(item.productId)}/>)
                    )) : (
                        <div className="empty-message"> 현재 추천상품이 존재하지 않습니다. </div>
                    )}
                </div>
            </div>
            <div className="section-container">
                <h2 className="section-title">전체 상품</h2>
                <div className="main-product-container">
                    {productListData && productListData ? (
                        productListData.productList?.map((item: Product) => (<ProductCard key={item.productId} product={item} onClick={() => onClickProductDetailEventHandler(item.productId)}/>)
                    
                    )) : (
                        <div className="empty-message"> 현재 등록된 상품이 없습니다. </div>
                    )}
                </div>
            </div>
            <div className="pagination-wrapper">
                <Pagination totalCount={productListData?.productList.length || 0} />
            </div>
            <div className="main-chat-container" onClick={onClickChatButtonClickToggle}>
                {chatButton ?//채팅방 활성화 비활성화 여부 .. 
                    <>
                        <div className="chat-floating-button"> x </div>
                        <ChatQna />
                    </>
                :
                    <div className="chat-floating-button">💬</div>
                }
            </div>
        </div>
    );
}

// 구조 
// 상단 배너
// 중단 상품
// 하단 채팅 아이콘 


// useQuery 의 데이터로 => " 클라이언트에 데이터를 주입받는다 "