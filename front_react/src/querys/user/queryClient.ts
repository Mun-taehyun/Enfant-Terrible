import { QueryClient } from "@tanstack/react-query";

/*defaultOptions => 모든 useQuery / useMutation 에  적용되는 전역 정책 
                  =>내부 queries 옵션 
                        =>retry : 요청 실패 시 재시도 횟수 
                        =>refetchOnWindowFodus: 자동 패치 on/off 
                        =>staleTime(단위 : 밀리초): 데이터 신선도 => 패치안하는 시간설정
                  =>내부 mutations 옵션 
                        =>retry : 요청 실패 시 재시도 횟수 
*/
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    }, //서버 통신이 안될 때 1번은 재시도를 한다 . 
    mutations: {
      retry: 1
    } //서버에 업로드 , 수정 , 삭제 요청이 실패했을 때 1번씩은 재시도를 한다.
  }
});
//전역으로 사용할 queryClient => useQuery , useMutation 에 공통 설정으로 들어간다. 