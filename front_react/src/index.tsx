import React from 'react';
import ReactDOM from 'react-dom/client';
import '/index.css';
import App from './App';
import {BrowserRouter} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';



const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

const queryClient = new QueryClient();
//쿼리 캐시 : quesyKey 데이터 매핑
//구독자 관리 : 특정 컴포넌트가 어떤 서버데이터를 구독 중인지.. (클라이언트 <> 서버)
//요청 중복 제거 : 네트워크 낭비 X => 최적화 
//캐시 무효화 / 리패치 : 추가, 수정 , 삭제에 용이 
//Mutation -> 상태 전파 : 특정 쿼리 영향 추적 등.. 


root.render( //Link , Route 를 하려면 BrowserRouter로 감싸져 있어야한다.. 
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </QueryClientProvider>
    </React.StrictMode>
);


//1차적으로 QueryClientProvider에 감싸져 있어야 => 조회 추가 수정 삭제 Query를 쓸 수 있다 "서버DB접근"


