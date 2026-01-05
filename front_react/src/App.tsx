import './App.css'
import { useQuery } from '@tanstack/react-query';
import Popup from '@/components/user/Popup';
import { getPopupListRequest } from './apis/user';
import type { GetPopupListResponseDto } from './apis/user/response/popup';
//공통라우터 정리 





function App() {




  //쿼리: 사용 활성화된 광고팝업 캐싱 
  const {data , error , isLoading} = useQuery<GetPopupListResponseDto[], string | number>(
    { 
      queryKey: ['popup'] , 
      queryFn: getPopupListRequest 
    }
  );

  if (isLoading) return <div> 팝업 업로드 중 </div>

  return (

    //컴포넌트 렌더링 설계
    // 


    <>
      {data?.map ((popupid) => <Popup popupList={item} />) }
    </>
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