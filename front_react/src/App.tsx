import { useEffect } from 'react';
import './App.css'
import Popup from '@/components/user/Popup';
import { Route, Routes, useLocation } from 'react-router-dom';
import UserContainer from './layouts/user/UserContainer';
import {AUTH_ADD_INFOMATION_PATH, AUTH_LOGIN_PATH, AUTH_OAUTH_PATH, AUTH_PATH, CART_PATH, MAIN_PATH, OAUTH_PATH, ORDER_COMPLETE_PATH, ORDER_DETAIL_PATH, ORDER_PATH, ORDER_PAYLOAD_PATH, POINT_PATH, POST_DETAIL_PATH, POST_PATH, PRODUCT_DETAIL_PATH, PRODUCT_PATH, USER_PATH, USER_UPDATE_PATH} from './constant/user/route.index';

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
import OrderCompletePage from './views/user/Order/Complete';
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
import LoginView from './views/admin/login.view';
import { PopupItem } from './types/user/interface';
import RequireAuth from './components/user/RequireAuth';

function App() {

  //쿼리: 사용 활성화된 광고팝업 캐싱 
  const {data : popupData} = popupQueries.usePopup();

  const popupArray = popupData?.popupList ?? [];

  const {pathname} = useLocation();

  // 마우스 포인터를 졸졸 따라다니는 단 하나의 발바닥
  useEffect(() => {
    // 1. 발바닥 요소 하나만 미리 생성
    const paw = document.createElement('div');
    paw.className = 'follow-paw';
    document.body.appendChild(paw);

    const handleMouseMove = (e: MouseEvent) => {
      // 2. 마우스 움직일 때마다 이 하나의 발바닥 위치만 계속 업데이트
      // 마우스 정중앙보다 약간 옆(+10px)에 두면 커서랑 안 겹치고 귀여워요!
      paw.style.left = `${e.pageX + 10}px`;
      paw.style.top = `${e.pageY + 10}px`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    // 컴포넌트 사라질 때 발바닥도 같이 삭제
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      paw.remove();
    };
  }, []);

  return (
    <>
    {pathname === MAIN_PATH() && popupArray.map((item : PopupItem) => (<Popup key={item.popupId} popupItem={item} />))}

    <Routes>
      <Route element={<UserContainer/>}>
        <Route path={MAIN_PATH()} element={<Main />}/>

        <Route path={AUTH_PATH()} >
          <Route path={AUTH_PATH() + AUTH_LOGIN_PATH()} element={<Authentication />}/>
          <Route path={AUTH_PATH() + AUTH_OAUTH_PATH()} element={<OAuthAddPage />}/>
          <Route path={AUTH_PATH() + AUTH_ADD_INFOMATION_PATH()} element={<PetInfomation />}/>
        </Route>
        <Route path={OAUTH_PATH()} element={<OAuthCallBack />} />
        
        <Route element={<RequireAuth />}>
          <Route path={USER_PATH()} element={<UserPage />}/>
          <Route path={USER_PATH() + USER_UPDATE_PATH(':userId')} element={<UserUpdate />} />
          <Route path={CART_PATH()} element={<Cart/>}/>
          <Route path={POINT_PATH()} element={<PointHistoryPage/>}/>
        </Route>
        <Route path={PRODUCT_PATH()} element={<ProductFilter />} />
        <Route path={PRODUCT_PATH() + PRODUCT_DETAIL_PATH(":productId")} element={<ProductDetail />} />
        <Route path={POST_PATH()} element={<PostList />} /> 
        <Route path={POST_PATH() + POST_DETAIL_PATH(':postId')} element={<PostDetailPage/>} />
        <Route path={ORDER_PATH()} >
          <Route element={<RequireAuth />}>
            <Route path={ORDER_PATH() + ORDER_PAYLOAD_PATH()} element={<OrderPreparePage/>} />
          </Route>
          <Route path={ORDER_PATH() + ORDER_COMPLETE_PATH()} element={<OrderCompletePage/>} />
          <Route path={ORDER_PATH() + ORDER_DETAIL_PATH(':orderId')} element={<OrderDetailView/>} />                                          
        </Route>
      </Route>
      <Route path="/admin/login" element={<LoginView />} />
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