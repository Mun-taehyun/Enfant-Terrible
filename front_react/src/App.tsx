import './App.css'
import { useQuery } from '@tanstack/react-query';
import Popup from '@/components/user/Popup';
import { getPopupListRequest } from './apis/user';
import type { GetPopupListResponseDto } from './apis/user/response/popup';
import { useEffect, useState } from 'react';
import type { PopupItem } from './types/user/interface';
import { Route, Routes } from 'react-router-dom';
import UserContainer from './layouts/user/UserContainer';
import { MAIN_PATH } from './constant/user';
import Main from './views/user/Main';
//공통라우터 정리 





function App() {

  //쿼리: 사용 활성화된 광고팝업 캐싱 
  const {data , error , isLoading} = useQuery<GetPopupListResponseDto>(
    { 
      queryKey: ['popup'] , 
      queryFn: getPopupListRequest 
    } // GetPopupListResponseDto 에 있는 isActive : true 일 경우에 받아온다. 
  );
  if (isLoading) return <div> 팝업 업로드 중 </div>
  if (error instanceof Error) return <div>{error.message}</div>;


  //상태 : 활성화된 팝업
  const [activeListPopup, setActiveListPopup] = useState<PopupItem[]>([]);

  //함수 : 

  //효과 : 팝업리스트 응답 조회를 위한 요청 
  useEffect(() => {
    if(!data) return; // data를 바로 사용 불가  
    
    // const dataPopup : PopupItem[] = data.popupList.map(item => item)
    // //popupList 개수만큼 배열이 생성 

    // for(let i = 0; data.popupList.length ; i++)
    //   if(data.popupList[i].isActive === true) dataPopup.push(data.popupList[i]);
    //   else continue;   // 아니면 반복작업 계속 시행 => isActive 검수.

    // => 필터를 쓰면 간단한 거였다... 
    const filtered = data.popupList.filter(item => item.isActive === true);
    setActiveListPopup(filtered); //활성화된 팝업만 상태를 받아온다. 

    // return dataPopup;
  }, []) //처음 들어올 때 List 활용 


  return (

    //컴포넌트 렌더링 설계
    // 
    <Routes>
      <Route element={<UserContainer/>}>
        <Route path={MAIN_PATH()} element={<Main />}/>
        {activeListPopup.map((item) => (<Popup popupItem={item} />))}
      </Route>
    </Routes>
  )
}
//광고 팝업 반환값 GetPopupListResponseDto | string | number 
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