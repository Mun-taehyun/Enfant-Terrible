import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import './style.css';



interface Props {
    totalCount : number | undefined;
    size : number;
}


export default function Pagination ({totalCount , size} : Props) {

    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const currentPage = Number(searchParams.get('page')) || 1;
    const safeTotalCount = totalCount ? totalCount : 0;

    const totalPage = Math.ceil(safeTotalCount / size) || 1;
    const currentSection = Math.ceil(currentPage / 10);
    const totalSection = Math.ceil(totalPage / 10) || 1;
    const startPage = (currentSection - 1) * 10 + 1;
    const endPage = Math.min(currentSection * 10, totalPage);

    const viewPageList: number[] = [];
    for (let i = startPage; i <= endPage; i++) {
        viewPageList.push(i);
    }

    const goToPage = (page: number) => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('page', String(page));
        navigate({ pathname: location.pathname, search: `?${nextParams.toString()}` });
    };

    const onPreviousClickHandler = () => {
        if (currentSection === 1) return;
        const previousSectionLastPage = (currentSection - 1) * 10;
        goToPage(previousSectionLastPage);
    };

    const onNextClickHandler = () => {
        if (currentSection === totalSection) return;
        const nextSectionFirstPage = currentSection * 10 + 1;
        goToPage(nextSectionFirstPage);
    };



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
            <div key={page} className='pagination-text' onClick={() => goToPage(page)}>{page}</div>
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