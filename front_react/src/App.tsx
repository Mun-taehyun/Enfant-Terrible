import './App.css'
import { useQuery } from '@tanstack/react-query';
import Popup from '@/components/user/Popup';
import { getPopupListRequest } from './apis/user';
import type { GetPopupListResponseDto } from './apis/user/response/popup';
import { useEffect } from 'react';
import type { PopupItem, User } from './types/user/interface';
import { Route, Routes } from 'react-router-dom';
import UserContainer from './layouts/user/UserContainer';
import {AUTH_ADD_INFOMATION_PATH, AUTH_LOGIN_PATH, AUTH_OAUTH_PATH, AUTH_PATH, MAIN_PATH, OAUTH_PATH, PRODUCT_CATEGORY_PATH, PRODUCT_PATH, USER_PATH} from './constant/user/route.index';
import Main from './views/user/Main';
import { useLoginUserStore } from './stores/user';
import { userQueries } from './querys/user/queryhooks';
import type { UserSelectResponseDto } from './apis/user/response/user';
import Authentication from './views/user/Authentication/SignAll';
import OAuthCallBack from './views/user/Authentication/OAuth/CallBack';
import OAuthAddPage from './views/user/Authentication/OAuth/Auth';
import PetMessage from './components/user/PetMessage';
import PetInfomation from './views/user/Authentication/PetInfo';
import UserPage from './views/user/MyPage/UserPage';
import {UserUpdate} from './views/user/MyPage/UserUpdate';
import ProductCategory from './views/user/Product/ProductCategory';
//공통라우터 정리 

const MOCK_POPUP_LIST: PopupItem[] = [
  {
    popupId: 1,
    title: "신규 가입 웰컴 쿠폰팩",
    content: "지금 가입하면 10만원 쿠폰팩 즉시 지급!",
    linkUrl: "https://example.com/event/1",
    fileUrl: "https://picsum.photos/id/10/400/500", // 고정 이미지
    isActive: true,
    endAt: "2026-12-31T23:59:59"
  },
  {
    popupId: 2,
    title: "겨울 시즌 한정 세일",
    content: "전 품목 최대 70% 할인 혜택을 놓치지 마세요.",
    linkUrl: "https://example.com/event/2",
    fileUrl: "https://picsum.photos/id/20/400/500",
    isActive: true,
    endAt: "2026-01-31T23:59:59"
  },
  {
    popupId: 3,
    title: "주말 특가 타임세일",
    content: null, // content가 null인 경우도 테스트
    linkUrl: "https://example.com/event/3",
    fileUrl: "https://picsum.photos/id/48/400/500",
    isActive: true,
    endAt: "2026-01-15T18:00:00"
  }
];



function App() {

  //쿼리: 사용 활성화된 광고팝업 캐싱 
  // const {data : popupData , error : popupError , isLoading : isPopupLoading } = useQuery<GetPopupListResponseDto, Error, PopupItem[]>(
  //   { 
  //     queryKey: ['popup'] , 
  //     queryFn: getPopupListRequest,
  //     select: (popupData: GetPopupListResponseDto) =>
  //           popupData.popupList.filter(item => (item.isActive === true))
  //   } // GetPopupListResponseDto 에 있는 isActive : true 일 경우에 받아온다. 
  // );

  //서버상태 : 회원가입 한 유저정보 조회 
  const {data : useData, error : useError } = userQueries.useMe();

  //상태보관 : 유저의 로그인/로그아웃 상태 
  const {setLoginUser ,resetLoginUser} = useLoginUserStore();


  //효과 : 팝업리스트 응답 조회와 유저 로그인 상태 
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if(!token) {
      resetLoginUser();
      localStorage.removeItem('accessToken');
      return;
    }
    // const loginUser : User = useData as UserSelectResponseDto 
    // 로그인 데이터 사용 
    // setLoginUser(loginUser);
  }, [useData, setLoginUser , resetLoginUser]) //처음 들어올 때 List 활용 

  // if (isPopupLoading) return <div> 팝업 업로드 중 </div>
  // if (popupError instanceof Error) return <div>{popupError.message}</div>;
  // if (useError instanceof Error) return <div>{useError.message}</div>;

  
  return (
    //컴포넌트 렌더링 설계
    //메인 페이지 /
    //Local 인증 페이지 /auth
    //      로그인/회원/비번바꾸기 페이지 /auth/login
    //      소셜 회원가입 추가 페이지 /auth/oauth
    //      펫정보 추가 페이지 /auth/add-infomation
    <>
    {/* {popupData?.map((item) => (<Popup key={item.popupId} popupItem={item} />))} */}
    <PetMessage name={useData?.name} />
    <Routes>
      <Route element={<UserContainer/>}>
        <Route path={MAIN_PATH()} element={<Main />}/>
        <Route path={AUTH_PATH()} >
          <Route path={AUTH_PATH() + "/" + AUTH_LOGIN_PATH()} element={<Authentication />}/>
          <Route path={AUTH_PATH() + "/" + AUTH_OAUTH_PATH()} element={<OAuthAddPage />}/>
          <Route path={AUTH_PATH() + "/" + AUTH_ADD_INFOMATION_PATH()} element={<PetInfomation />}/>
        </Route>
        <Route path={OAUTH_PATH(":accessToken")} element={<OAuthCallBack />} />
        <Route path={USER_PATH()} element={<UserUpdate />}>
          {/* <Route path={USER_PATH() + "/" + USER_UPDATE_PATH(":useData?.userId")} element{<UserUpdate />} /> */}
        </Route>
        <Route path={PRODUCT_PATH()} >
          <Route path={PRODUCT_PATH() + "/" + PRODUCT_CATEGORY_PATH(":categoryId")} element={<ProductCategory />} />
        </Route>
      </Route>
      <Route path='*' element={<h1>404 오류</h1>} />
    </Routes>
    </>
  )
} 
export default App


//리액트 쿼리 useQuery
// data , error , isLoading , isFetching , isError , refetch , remove 
// data : 데이터값 받아옴 => axios 성공값 
// error : 실패 시 값 받아옴 => axios 실패값 
// isLoading : 캐시값이 없는 상태 => 로딩 여부 
// isFetching : 데이터를 가져오는 중 여부 
// isError : 에러 발생여부 
// refetch : 수동으로 다시 데이터 가져옴
// remove : 캐시에서 쿼리 제거 