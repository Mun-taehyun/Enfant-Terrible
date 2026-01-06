import type { CategoryItem } from "@/types/user/interface";


interface Props {
    categoryItem: CategoryItem; // 카테고리 객체
}


//컴포넌트 카테고리 
export default function Category( {categoryItem} : Props) {

    //속성 : 카테고리 아이템 
    const { parentId, name , depth,} = categoryItem;


    //렌더 : 카테고리 
    return(
        <>
            {parentId !== null && depth == 0 ? //부모id가 존재하면 대분류 카테고리로 노출 
            <div id ="categoryLarge">
                <div className="categoryLarge-container-box">
                    <div className="categoryLarge-context">{name}</div>
                </div> 
            </div>
            : // 부모id가 존재하지 않으면 소분류 카테고리로 노출 
            <div id="categorySmall">
                <div className="categorySmall-container-box">
                    <div className="categorySmall-context">{name}</div>
                </div> 
            </div>
            }
        </>
    );
}