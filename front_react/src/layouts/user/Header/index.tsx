import CategoryItemList from "@/components/user/CategoryItemList";
import { AUTH_PATH, CART_PATH, MAIN_PATH, PRODUCT_SEARCH_PATH, USER_PATH } from "@/constant/user/route.index";
import { useLoginUserStore } from "@/stores/user"
import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";


//컴포넌트 : 헤더 
export default function Header() {

    //참조 : 검색입력란 
    const searchButtonRef = useRef<HTMLDivElement | null>(null); //DOM 업데이트 이전엔 null.. 

    //상태 : 로그인 상태 여부
    const {loginUser , resetLoginUser} = useLoginUserStore();

    //상태 : 검색버튼 활성화 여부 
    const [searchButton, setSearchButton] = useState<boolean>(false);

    //상태 : 검색어 변환 여부 
    const [searchWord, setSearchWord] = useState<string>('');

    //함수 : 네비게이트 함수
    const navigate = useNavigate();

    //이벤트핸들러 : 검색버튼 클릭 이벤트 처리 
    const onSearchClickHandler = () => {
        if(!searchButton) {
            setSearchButton(!searchButton);
            return;
        }//on/off 기능 
        //제품 검색 => 리스트 불러올 곳 . 
        navigate(PRODUCT_SEARCH_PATH(searchWord));
    }

    //이벤트핸들러 : 검색어 이벤트 처리 
    const onSearchChangeHandler = (event : ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchWord(value);
    }

    //이벤트핸들러 : 엔터를 쳤을 경우 검색어 이벤트 처리 
    const onSearchEventHandler = (event : KeyboardEvent<HTMLInputElement>) => {
        if( event.key !== 'Enter') return;
        if(!searchButtonRef.current) return; // "입력값 x "
        searchButtonRef.current.click();
    } //엔터를 눌렀을 때 클릭 이벤트와 동일시


    //이벤트핸들러 : 로그인 버튼 클릭 이벤트 처리 
    const onLoginButtonClickEventHandler = () => {
        navigate(AUTH_PATH());
    }

    //이벤트핸들러 : 로그아웃 버튼 클릭 이벤트 처리 
    const onLogoutButtonClickEventHandler = () => {
        const accessToken = localStorage.getItem("accessToken");
        if(loginUser === null && !accessToken) return; 
        //로그인 상태 / 엑세스토큰 존재 x 
        resetLoginUser();
        localStorage.removeItem("accessToken");

        //로그아웃 후 => 메인페이지.. 
        navigate(MAIN_PATH());
    }

    //이벤트핸들러 : 장바구니 버튼 클릭 이벤트 처리 
    const onCartButtonClickEventHandler = () => {
        const accessToken = localStorage.getItem("accessToken");
        const userId = localStorage.getItem("userId"); 
        if( loginUser === null || !accessToken  || userId === null) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("userId");
            resetLoginUser();
            return;
        }
        //검증 완료 (로그인 상태)
        navigate(CART_PATH(userId));
    }

    //이벤트핸들러 : 마이페이지 버튼 클릭 이벤트 처리 
    const onMyPageButtonClickEventHandler = () => {
        const accessToken = localStorage.getItem("accessToken");
        const userId = localStorage.getItem("userId"); 
        if( loginUser === null || !accessToken  || userId === null) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("userId");
            resetLoginUser();
            return;
        }
        //검증 완료 (로그인상태)
        navigate(USER_PATH());
    }

    //효과 : 검색어 경로 변경 될 때마다 실행될 함수 
    // useEffect(() => {
    //     if(searchWord) {
    //         setSearchWord(searchWord); //검색어가 남아있도록.. 
    //         setSearchButton(true);//다시 검색 가능하게
    //     }
    // }, [])


    return (
       <div id="header-container">
            <div className="header-main-box">
                <div className="header-main-logo-box">
                    <div className="header-logo-content">{'앙팡테리블'}</div>
                </div>
                {searchButton ?
                <div className="header-main-search-box">
                    <input type='text' placeholder='검색어를 입력해주세요' value={searchWord} onChange={onSearchChangeHandler} onKeyDown={onSearchEventHandler} />
                    <div ref={searchButtonRef} className="header-search-icon-box" onClick={onSearchClickHandler}>
                        <div className="icon search-light-icon"></div>
                    </div>
                </div> : //입력칸 활성화 true
                <div className="header-main-search-box">
                    <div className="header-search-icon-box" onClick={onSearchClickHandler}>
                        <div className="icon search-light-icon"></div>
                    </div>
                </div> //입력칸 비활성화 false
                } 
                {loginUser !== null ?
                <div className="header-main-button-box">
                    <div className="header-main-button-cart" onClick={onCartButtonClickEventHandler}>{'장바구니'}</div>
                    <div className="header-main-button-mypage" onClick={onMyPageButtonClickEventHandler}>{'마이페이지'}</div>
                    <div className="header-main-button-logout" onClick={onLogoutButtonClickEventHandler}>{'로그아웃'}</div>
                </div> :
                <div className="header-main-button-box">
                    <div className="header-main-button-auth" onClick={onLoginButtonClickEventHandler}>{'로그인'}</div>
                </div>
                }
            </div>
            {/* <div className="header-category-box">
                <CategoryItemList />
            </div>  */}
            {
            //카테고리 대분류 배열 => 서버한테 받아와야 한다. 
            //컴포넌트 크기가 중요하다 => CategoryLarge  
            //                        => CategorySmall  컴포넌트 제작 
            }
       </div> 
    )

}
// 버튼 박스 
// 비회원 상태 로그인/회원가입 
// 회원 상태  장바구니 , 로그아웃 , 마이페이지 
