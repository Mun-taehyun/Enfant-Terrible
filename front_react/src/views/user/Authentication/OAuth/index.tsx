import { MAIN_PATH } from "@/constant/user";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";


export default function OAuth() {

    const { accessToken , accessExpirationTime } = useParams();

    const navigate = useNavigate();

    useEffect(() => {

        if (!accessToken || !accessExpirationTime) return;

        const now = (new Date().getTime()) * 1000;
        const expires = new Date(now + accessExpirationTime);

        localStorage.setItem("accessToken" , accessToken);
        //날짜 객체 => 숫자화 ?? 
        const diffMs : number = expires.getTime() - now;
        if(Date.getTime())
        


        navigate(MAIN_PATH());
    }, [accessToken])


    return (
        <></>
    )
}