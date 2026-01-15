import { CategoryChildItem } from "@/apis/user/response/category/get-category-children.response.dto";




interface Props {
    categoryName: number; //선 필터링 정보 
    categoryList: CategoryChildItem[];
}//자식 카테고리 리스트를 가져온다. => 필터되어 있는 것 위주로


export default function ProductFilterCard ({ categoryList , categoryName }: Props) {

    //속성 : 소분류 카테고리 데이터 정보 
    const {name} = categoryList;


    //렌더 : 상품 필터 
    return(

        <div className="filter-container">
            <div className="category-group">
                <div className="category-list">
                    <div className="category-item active">{categoryName}</div>
                    <div className="category-item">가슴줄/하네스 (2)</div>
                    <div className="category-item">이동가방 (1)</div>
                </div>
            </div>

            {/* 검색 영역 */}
            <div className="filter-search-group">
                <div className="filter-label">검색옵션</div>
                    <div className="filter-search-wrapper">
                    <input 
                        type="text" 
                        className="filter-input" 
                        placeholder="검색어 입력" 
                        defaultValue="옐로우"
                    />
                    <button className="filter-clear-btn">×</button>
                </div>
            </div>
        </div>
    );
}

//대분류 CategoryName 까지만.... => parentId의 name 데이터만 가져오면 됨 
// parentId = useSearchParams로 가져오면 됨 


//소분류 리스트 가져와야하고 특정 부모 즉 parentId와 관련된 소분류 리스트만 가져와야함 
// 그럼 filter((item) => item.parentId === parentId) 로 select분류  