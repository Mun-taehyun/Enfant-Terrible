import type {User} from "@/types/user/interface";
import {create} from 'zustand';

interface LoginUserStore {
    loginUser: User | null; 
    setLoginUser: (loginUser: User) => void;
    resetLoginUser: () => void;
};

const useLoginUserStore = create<LoginUserStore>(set => ({
    loginUser: null,
    //User를 받게 된다면.. 
    // state = {loginUser: null} 
    // state = {loginUser: {email : ? , nickname : ? , profileImage : ? } 로 로그인상태..인식}
    setLoginUser: loginUser => set(state => ({...state, loginUser})),
    // loginUser 넣으면 . => set(상태변화 .. => null에서 loginUser로 변화한다..)
    resetLoginUser: () => set(state => ({...state, loginUser: null}))
    //로그아웃 시 상태 처리.. 
}))


export default useLoginUserStore;


/*
    Zustand 개념 (Redux보다 훨씬 간편하고 규모 작은 프로젝트에서 용이)

    -상태
    -액션(함수)
    -set함수
    -상태변경로직 
    을 담고 있다.. 

*/