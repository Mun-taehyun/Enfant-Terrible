import CategoryItemList from "@/components/user/CategoryItemList";
import { AUTH_LOGIN_PATH, AUTH_PATH, CART_PATH, MAIN_PATH,USER_PATH } from "@/constant/user/route.index";
import { useLoginUserStore } from "@/stores/user"
import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import './style.css';
import { useProduct } from "@/hooks/user/product/use-product.hook";


//컴포넌트 : 헤더 
export default function Header() {



    //상태 : 로그인 상태 여부
    const {loginUser , resetLoginUser} = useLoginUserStore();

    //함수 : 네비게이트 
    const navigate = useNavigate();

    //이벤트핸들러 : 로그인 버튼 클릭 이벤트 처리 
    const onLoginButtonClickEventHandler = () => {
        navigate(AUTH_PATH() + "/" + AUTH_LOGIN_PATH());
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

//=====================================  검색 내부 컴포넌트 ==============================
    // 컴포넌트 : 검색버튼
    const SearchButton = () => {

        //============================== 상태 변경 선언 모둠 ==============
        //커스텀 훅 : 제품 검색 필터를 위한 이벤트 처리 
        const {
            updateSearchFilter ,
        } = useProduct();


        //참조 : 검색 버튼 요소
        const searchButtonRef = useRef<HTMLDivElement | null>(null);

        //상태 : 검색버튼
        const [status, setStatus] = useState<boolean>(false);//useState에는 boolean 자료형만 담김
            //검색버튼에 따라 검색창이 뜰 지 말 지 결정?

        //상태 : 검색어 입력값받기
        const [keyword, setKeyword] = useState<string>('');

        // ==============================================================
        //useState 는 새로고침 또는 리로딩이 되면 초기값으로 돌아간다.... 
        //useParams 는 주소경로를 담는 함수.. 




        //============================== 이벤트 핸들러 선언 모둠 ==============
        //이벤트 핸들러: 검색어 변경 이벤트 처리
        const onSearchWordChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            setKeyword(value);
        };

        //이벤트핸들러 : 상단 검색 엔터 시 이벤트핸들러 (기본 필터 유지x)
        const onSearchKeyDownEventHandler = (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key !== "Enter") return;
            updateSearchFilter({
                keyword: event.currentTarget.value,
                categoryId: "",
                page: "1"
            })
        };

        //이벤트 핸들러: 검색버튼 클릭 이벤트 처리 함수
        const onSearchButtonClickHandler = () => {
            if(!status) {
                setStatus(!status);
                return;
            } // status false 라면 => true로 상태를 바꾸고. 
            //status true에서 누르면 
            updateSearchFilter({
                keyword: "keyword",
                categoryId: "",
                page: "1"
            });
        };
        // ==============================================================


        //효과 : 검색어 경로 변경 될 때마다 실행될 함수 
        useEffect(() => {
            if(keyword) {
                setKeyword(keyword);
                setStatus(true);
            }
        }, [keyword])
        //searchWord가 변할 때마다 실행된다


        if (!status)
        // 렌더링 : 검색 버튼 false 상태
        return (
            <div className='icon-button' onClick={onSearchButtonClickHandler}>
                <div className='icon search-light-icon'></div>
            </div>
        );
        // 렌더링 : 검색 버튼 true 상태
        return (
            <div className='header-search-input-box'>
                <input className='header-search-input' type='text' placeholder='검색어를 입력해주세요' value={keyword} onChange={onSearchWordChangeHandler} onKeyDown={(event) => onSearchKeyDownEventHandler(event)}/>
                <div ref={searchButtonRef} className='icon-button' onClick={onSearchButtonClickHandler}>
                    <div className='icon search-light-icon'></div>
                </div>
            </div>
        );
        //onChange (input) 
    }


    return (
       <div id="header-container">
            <div className="header-main-box">
                <div className="header-main-logo-box">
                    <div className="header-logo-content">{'앙팡테리블'}</div>
                </div>
                <SearchButton />
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
            <div className="header-main-category-box">
                <CategoryItemList />
            </div>
       </div> 
    )
}
// 버튼 박스 
// 비회원 상태 로그인/회원가입 
// 회원 상태  장바구니 , 로그아웃 , 마이페이지 
