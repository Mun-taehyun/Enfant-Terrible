import { useProduct } from "@/hooks/user/product/use-product.hook";
import { useEffect } from "react";





// 컴포넌트 : 카테고리제품화면
export default function ProductFilter() {

    // 커스텀 훅 : 검색 누적 형식으로 필터 적용 
    const {

    } = useProduct();

    //효과 : 주소창(url)이 변할 때마다 실행되는 함수 
    useEffect( () => {
        
    }, [searchParams])


    // 렌더 : 카테고리제품
    return(
        <>
        </>
    );

}