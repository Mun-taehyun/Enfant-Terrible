import { categoryQueries} from '@/querys/user/queryhooks';
import './style.css';
import { useDynamicSlide } from '@/hooks/user/uiControl/use-custom.hook';
import { CategoryChildItem } from '@/apis/user/response/category/get-category-children.response.dto';
import { useProduct } from '@/hooks/user/product/use-product.hook';




//컴포넌트 : 카테고리 리스트 
export default function CategoryItemList(){

    //커스텀 훅 : 카테고리 버튼을 누를 시 쿼리스트링 누적 
    const {HeaderCategoryEventHandler} = useProduct();

    //서버상태 : 카테고리 전체 리스트 SQL 조회 
    const {data , isLoading} = categoryQueries.useCategoryList();

    //훅: 카테고리 리스트 유연한 너비 계산
    const { scrollX, handleMove, containerRef, isStart, isEnd, canScroll, visibleIndices} = useDynamicSlide([data?.menuTree]);

    //data 존재여부를 일단 검증해야함.
    if (isLoading || !data) return <div className="category-view-box" style={{ height: '60px' }} />;

    return (
    <div className="category-view-box">
        {!isStart && canScroll && ( //시작지점이라면 이전버튼은 활성화 x
            <button className="category-large-left-box" onClick={() => handleMove('prev')}>
                <span className="arrow">❮</span>
            </button>
        )}
        {!isEnd && canScroll && (
            //마지막지정이거나 대분류 크기가 5이상이 아니면 이후버튼활성화 x (불필요여부)
            <button className="category-large-right-box" onClick={() => handleMove('next')}>
                <span className="arrow">❯</span>
            </button>
        )}
        <div className="category-large-control-box">
            <div className="category-main-box" ref={containerRef} style={{ transform: `translateX(${scrollX}px)` }}>
                {data.menuTree.map((item, index) => (
                    <div key={item.categoryId} data-index={index} className="category-large-input-box"
                         style={{
                            visibility: visibleIndices.has(index) ? 'visible' : 'hidden',
                            opacity: visibleIndices.has(index) ? 1 : 0,
                            transition: 'opacity 0.4s ease-in-out, visibility 0.4s'
                            //has함수로 들어있는 여부 판단 => 보일 지 감출 지 결정. 
                         }}    
                    >
                        <h3 className="category-large-name">{item.name}</h3>
                        <div className="category-small-box">
                            <div className="category-small-input-box">
                                {item.child.map((sub : CategoryChildItem) => (
                                    <span key={sub.categoryId} className="category-small-name" onClick={() => HeaderCategoryEventHandler('sub.categoryId')}>{sub.name}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
    );
};

//불러와야 할 카테고리 리스트 => 전체 
// 클릭 이벤트 통일 categoryId에 맞게 ... 


// 내가 판단해야할 알고리즘 
// 대분류 리스트 2개가 있다 치자. 
// 대분류 1이 있다 하면 소분류 판넬이 추가 생성이 되는거 ok? 
/*
    1차 생각정리 

    대분류 => map 으로 리스트 뽑아온다 . 
    
            => 리스트 개수만큼 소분류를 그 parentId에 맞게 불러온다. 

    map => largeC 
        이때 small 카테고리 생성배열 등장 

    map ( <div ></div>)
    parantIdList.map( <div></div> ) 아 여기서 1차 필터 적용 . 

    select filter( isActive , parentId 두개로 검증 )

    대분류 카테고리 리스트 map( <div>
        해당 parentId에 해당하는 소분류 카테고리 리스트 map ( <div> </div>)
    </div>)

*/