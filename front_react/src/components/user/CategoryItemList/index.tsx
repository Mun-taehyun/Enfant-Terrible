import { categoryQueries} from '@/querys/user/queryhooks';
import './style.css';
import { useDynamicSlide } from '@/hooks/user/uiControl/use-custom.hook';
import { CategoryItem } from '@/types/user/interface';




//컴포넌트 : 카테고리 리스트 
export default function CategoryItemList(){

    //서버상태 : 카테고리 전체 리스트 SQL 조회 
    const {data , isLoading} = categoryQueries.useCategoryList();

    //훅: 카테고리 리스트 유연한 너비 계산
    const { scrollX, handleMove, containerRef, isStart, isEnd } = useDynamicSlide();

    //data 존재여부를 일단 검증해야함.
    if (isLoading || !data) return null;

    return (
    <div className="mega-menu-viewport">
        {!isStart && (
            <button className="nav-btn left" onClick={() => handleMove('prev')}>
                <span className="arrow">❮</span>
            </button>
        )}
        {!isEnd && data.menuTree.length > 5 && ( 
            <button className="nav-btn right" onClick={() => handleMove('next')}>
                <span className="arrow">❯</span>
            </button>
        )}
        <div className="rail-window">
            <div className="mega-menu-rail" ref={containerRef} style={{ transform: `translateX(${scrollX}px)` }}>
                {data.menuTree.map((item) => (
                    <div key={item.categoryId} className="category-column">
                        <h3 className="main-item-name">{item.name}</h3>
                        {/* 📌 소분류 판넬: 전체를 다 그리지 말고, 현재 item의 소분류만 그립니다. */}
                        <div className="sub-menu-drop">
                            <div className="sub-menu-inner">
                                {item.subItems.map((sub : CategoryItem) => (
                                    <span key={sub.categoryId} className="sub-item-text">{sub.name}</span>
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