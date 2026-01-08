import {Outlet, useLocation} from 'react-router-dom';
// import Footer from '@/layouts/user/Footer';
import Header from '@/layouts/user/Header';
import { AUTH_PATH }  from '@/constant/user';


// 컴포넌트 (레이아웃)
export default function UserContainer() {

    //상태 : 현재 페이지 경로 이름 
    const {pathname} = useLocation();
    //모든 경로에 헤더 푸터를 가질 수 없음 => 조건을 넣어줘야한다.. 

    //렌더링
    return (
        <>
            {pathname !== AUTH_PATH() && <Header />}
            <Outlet />
            {/* {pathname !== AUTH_PATH() && <Footer/>} */}
        </>
    )//Footer 는 메인에서만 이용
}