import { UserSelectResponseDto } from "@/apis/user/response/user";
import { AUTH_OAUTH_PATH, AUTH_PATH, MAIN_PATH } from "@/constant/user/route.index";
import { userQueries } from "@/querys/user/queryhooks";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";


//컴포넌트: 소셜 로그인 시 다이렉트 처리
export default function OAuthCallBack() {

    //서버상태 : 회원가입 한 유저정보 조회 
    const {data : useData, error : useError } = userQueries.useMe();

    //쿼리스트링 상태 : 리다이렉트로 보내준 토큰변수를 가져온다. 
    const [searchToken] = useSearchParams();

    const navigate = useNavigate();

    //효과: accessToken 검증 
    useEffect(() => {
        const accessToken = searchToken.get("accessToken");
        if (!accessToken) {navigate(AUTH_PATH(),{replace: true}); return;}
        localStorage.setItem("accessToken" , accessToken);
    }, [searchToken, navigate])

    //효과: 처음 등록된 유저인지 아닌지 검증 후 => 추가정보 입력창으로 이동
    useEffect(() => {
        if(!useData) return;
        const {tel} = useData as UserSelectResponseDto;
        if(!tel) {//추가 정보가 없는 유저는 => 추가정보 입력창으로 간다.. 
            navigate(AUTH_PATH() + "/" + AUTH_OAUTH_PATH(),{replace: true})
            return;
        }
        else{navigate(MAIN_PATH()); return;}
    }, [useData, navigate])

    if (useError instanceof Error) return <div>{useError.message}</div>;
    return (
        <>
            <div>{'소셜 로그인 중 입니다.'}</div>
        </>
    )
}