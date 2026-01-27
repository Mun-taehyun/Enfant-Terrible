import { useProduct } from "@/hooks/user/product/use-product.hook";
import { usePagination } from "@/hooks/user/uiControl/use-pagination.hook";
import './style.css';



interface Props {
    totalCount : number | undefined;
    onPageChange?: (page : number) => void;
}


export default function Pagination ({totalCount} : Props) {


    //커스텀 훅 : 페이징 처리
    const {
        onPageClickHandler
    } = useProduct();

    const {
        viewPageList,currentPage,
        onPreviousClickHandler, onNextClickHandler
    } = usePagination(totalCount ? totalCount : 0); //전체 값 줘야 페이징처리 시작. 
    



    return (
        <div id='pagination-wrapper'>
            <div className='pagination-change-link-box'>
                <div className='icon-box-small'>
                    <div className='icon expend-left-icon'></div>
                </div>
                <div className='pagination-change-link-text' onClick={onPreviousClickHandler}>{'이전'}</div>
            </div>
            <div className='pagination-divider'>{'|'}</div>

            {viewPageList.map(page =>  //해당 페이지 -> 해당 페이지 이동은 안하므로.. 
            page === currentPage ?
            ( <div key={page} className='pagination-text-active'>{page}</div> ):
            <div key={page} className='pagination-text' onClick={() => onPageClickHandler(page)}>{page}</div>
            )}

            <div className='pagination-divider'>{'|'}</div>
            <div className='pagination-change-link-box'>
                <div className='pagination-change-link-text' onClick={onNextClickHandler}>{'다음'}</div>
                <div className='icon-box-small'>
                    <div className='icon expend-right-icon'></div>
                </div>
            </div>
        </div>
    );
}