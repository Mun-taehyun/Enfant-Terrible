import { categoryQueries} from '@/querys/user/queryhooks';
import './style.css';
import { useDynamicSlide } from '@/hooks/user/uiControl/use-custom.hook';



//컴포넌트 : 카테고리 리스트 
export default function CategoryItemList(){
    const { data} = categoryQueries.useCategoryList();

    // 2. UI 로직 레이어 (Custom Hook)
    // 한 칸 이동 거리를 280px로 설정 (CSS min-width 고려)
    const { scrollX, handleMove, containerRef } = useDynamicSlide();

    if (!data) return null;

    return (
        <div className="mega-menu-viewport">
            <button className="nav-btn left" onClick={() => handleMove('prev')}>〈</button>
            <button className="nav-btn right" onClick={() => handleMove('next')}>〉</button>

            <div 
                className="mega-menu-rail" 
                ref={containerRef} // 훅에서 넘겨받은 ref 연결
                style={{ transform: `translateX(${scrollX}px)` }}
            >
                {data.menuTree.map((item) => (
                    <div key={item.categoryId} className="category-column">
                        <h3 className="main-item-name">{item.name}</h3>
                        {/* 소분류 리스트... */}
                    </div>
                ))}
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