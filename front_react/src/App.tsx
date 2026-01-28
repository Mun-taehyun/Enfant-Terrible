import './App.css'
import Popup from '@/components/user/Popup';
import { Route, Routes } from 'react-router-dom';
import UserContainer from './layouts/user/UserContainer';
import {AUTH_ADD_INFOMATION_PATH, AUTH_LOGIN_PATH, AUTH_OAUTH_PATH, AUTH_PATH, CART_PATH, MAIN_PATH, OAUTH_PATH, ORDER_DETAIL_PATH, ORDER_PATH, ORDER_PAYLOAD_PATH, POINT_PATH, POST_DETAIL_PATH, POST_PATH, PRODUCT_DETAIL_PATH, PRODUCT_PATH, USER_PATH, USER_UPDATE_PATH} from './constant/user/route.index';
import Main from './views/user/Main';
import { popupQueries} from './querys/user/queryhooks';
import Authentication from './views/user/Authentication/SignAll';
import OAuthCallBack from './views/user/Authentication/OAuth/CallBack';
import OAuthAddPage from './views/user/Authentication/OAuth/Auth';
import PetInfomation from './views/user/Authentication/PetInfo';
import UserPage from './views/user/MyPage/UserPage';
import {UserUpdate} from './views/user/MyPage/UserUpdate';
import ProductFilter from './views/user/Product/ProductFilter';
import ProductDetail from './views/user/Product/ProductDetail';
import PostList from './views/user/Post/List';
import PostDetailPage from './views/user/Post/Detail';
import OrderDetailView from './views/user/Order/Detail';
import OrderPreparePage from './views/user/Order/Payment';
import { Cart } from './views/user/Cart';
import PointHistoryPage from './views/user/Point';
import AdminLayout from './layouts/admin/AdminLayout';
import SalesView from './views/admin/sales.view';
import UsersView from './views/admin/users.view';
import CategoriesView from './views/admin/categories.view';
import ProductsView from './views/admin/productsView';
import PaymentsView from './views/admin/payments.view';
import PostsView from './views/admin/posts.view';
import PopupsView from './views/admin/popups.view';
import BannersView from './views/admin/banners.view';
import ProductInquiriesView from './views/admin/ProductInquiriesView';
import QnaRoomsView from './views/admin/QnaRoomsView';
import QnaMessagesView from './views/admin/QnaMessagesView';
import RecommendationsView from './views/admin/RecommendationsView';
import OrdersView from './views/admin/orders.view';



function App() {

  //쿼리: 사용 활성화된 광고팝업 캐싱 
  const {data : popupData, isLoading : isPopupLoading } = popupQueries.usePopup();

  const popupArray = popupData?.popupList ?? [];

  if (isPopupLoading) return <div> 팝업 업로드 중 </div>

  
  return (
    //컴포넌트 렌더링 설계
    //      메인 페이지 /         d
    //      인증 페이지 /auth     d
    //      로그인/회원/비번바꾸기 페이지 /auth/login       d
    //      소셜 회원가입 추가 페이지 /auth/oauth           d
    //      펫정보 추가 페이지 /auth/add-infomation         d
    //      소셜 리다이렉트 /http://localhost:3000/oauth/callback

    //      유저 마이페이지 /user           d
    //      유저 수정페이지 /user/:userId     d

    //      제품 필터페이지 /product    ... 쿼리스트링 방식으로 생략해두고 이동   d
    //      제품 상세페이지 /product/:productId     d

    //      공지 목록페이지 /post       
    //      공지 상세페이지 /post/:postId       

    //      주문 상세페이지 /order/:orderId     
    //      결제 준비페이지 /order/payload      

    //      포인트 히스토리페이지 /point      

    //      장바구니페이지 /cart        

    <>
    {popupArray.map((item) => (<Popup key={item.popupId} popupItem={item} />))}

    <Routes>
      <Route element={<UserContainer/>}>
        <Route path={MAIN_PATH()} element={<Main />}/>
        <Route path={AUTH_PATH()} >
          <Route path={AUTH_PATH() + "/" + AUTH_LOGIN_PATH()} element={<Authentication />}/>
          <Route path={AUTH_PATH() + "/" + AUTH_OAUTH_PATH()} element={<OAuthAddPage />}/>
          <Route path={AUTH_PATH() + "/" + AUTH_ADD_INFOMATION_PATH()} element={<PetInfomation />}/>
        </Route>
        <Route path={OAUTH_PATH()} element={<OAuthCallBack />} />
        
        <Route path={USER_PATH()} element={<UserPage />}/>
        <Route path={USER_PATH() + USER_UPDATE_PATH(':userId')} element={<UserUpdate />} />
        <Route path={PRODUCT_PATH()} element={<ProductFilter />} >
          <Route path={PRODUCT_PATH() + "/" + PRODUCT_DETAIL_PATH(":productId")} element={<ProductDetail />} />
        </Route>
        <Route path={POST_PATH()} element={<PostList />}> 
          <Route path={POST_PATH() + "/" +POST_DETAIL_PATH(':postId')} element={<PostDetailPage/>} />
        </Route>
        <Route path={ORDER_PATH()} >
          <Route path={ORDER_PATH + "/" + ORDER_DETAIL_PATH(':orderId')} element={<OrderDetailView/>} />
          <Route path={ORDER_PATH + "/" + ORDER_PAYLOAD_PATH()} element={<OrderPreparePage/>} />                          
        </Route>
        <Route path={CART_PATH()} element={<Cart/>}/>
        <Route path={POINT_PATH()} element={<PointHistoryPage/>}/>
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<SalesView />} />
        <Route path="sales" element={<SalesView />} />

        <Route path="users" element={<UsersView />} />
        <Route path="categories" element={<CategoriesView />} />
        <Route path="products" element={<ProductsView />} />

        <Route path="payments" element={<PaymentsView />} />
        <Route path="posts" element={<PostsView />} />
        <Route path="popups" element={<PopupsView />} />
        <Route path="banners" element={<BannersView />} />
        <Route path="product-inquiries" element={<ProductInquiriesView />} />
        <Route path="qna">
          <Route index element={<QnaRoomsView />} />
          <Route path=":roomId" element={<QnaMessagesView />} />
        </Route>
        <Route path="recommendations" element={<RecommendationsView />} />
        <Route path="orders" element={<OrdersView />} />
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
