import { useProduct } from "../product/use-product.hook";


//컴포넌트 : 페이지네이션 (전체 상품 / 리뷰 / 문의 개수 (리스트 길이) , 한 페이지에 필요한 객체 개수)
export const usePagination = (totalCount: number , size: number) => {

        //커스텀 훅 : 경로변수 , 클릭이벤트 재활용 
        const { params, onPageClickHandler } = useProduct();

        const currentPage = Number(params.page) || 1;
        


        const totalPage = Math.ceil(totalCount / size) || 1; //전체페이지 수 
        const currentSection = Math.ceil(currentPage / 10); //현재섹션
        const totalSection = Math.ceil(totalPage / 10) || 1; //전체섹션
        const startPage = (currentSection - 1) * 10 + 1; //시작값 1 , 11 , 21 , 31 ....
        const endPage = Math.min(currentSection * 10, totalPage); // 끝값 10 , 20 , 또는 마지막값 

        const viewPageList = [];
        for (let i = startPage; i <= endPage; i++) {
            viewPageList.push(i);
        }

        //이벤트핸들러 : 경로변수 page값 변화와 이전섹션 이벤트 처리 
        const onPreviousClickHandler = () => {
            if (currentSection === 1) return;
            const previousSectionLastPage = (currentSection - 1) * 10;
            onPageClickHandler(previousSectionLastPage);
        };

        //이벤트핸들러 : 경로변수 page값 변화와 이후섹션 이벤트 처리 
        const onNextClickHandler = () => {
            if (currentSection === totalSection) return;
            const nextSectionFirstPage = currentSection * 10 + 1;
            onPageClickHandler(nextSectionFirstPage);
        };

    return {
        currentPage,
        viewPageList,
        onPreviousClickHandler,
        onNextClickHandler,
        // 필요하다면 T 타입을 사용하는 추가 상태를 반환할 수도 있음
    };
};