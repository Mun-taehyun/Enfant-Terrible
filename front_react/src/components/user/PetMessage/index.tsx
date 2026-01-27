import { useState, useEffect } from 'react';
import './style.css';
import { useNavigate } from 'react-router-dom';
import { AUTH_ADD_INFOMATION_PATH, AUTH_PATH } from '@/constant/user/route.index';

interface Props {
  name : string | undefined;
}

const PetMessage = ({ name }: Props) => {

    //상태 : 펫 정보 팝업창 보기 
    const [show, setShow] = useState(false);

    //함수 : 네비게이트 
    const navigate = useNavigate();


    //효과 : 처음 회원가입 완료 시 
    useEffect(() => {
        // 0.8초 후 자연스럽게 등장
        const timer = setTimeout(() => setShow(true), 800);
        return () => clearTimeout(timer);
    }, []);


    //렌더 : 펫 메세지
    if (!show) return null;
    return (
        <div className="modal-overlay" onClick={() => setShow(false)}>
            <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            
            {/* 상단 알림 바 영역 */}
                <div className="top-bar">
                    <div className="app-info">
                        <span className="icon">🐾</span>
                        <span className="name">알림</span>
                    </div>
                    <div className="time-text">방금 전</div>
                </div>
                <div className="content-area">
                    <div className="title">반가워요, {name}님! 👋</div>
                    <div className="desc">
                        혹시 지금 옆에 귀여운 아이와 함께 계신가요?<br/>
                        어떤 아이인지 알려주시면 저희가 더 반갑게<br/>
                        인사하고 딱 맞는 정보를 챙겨드릴게요!
                    </div>
                </div>
                <div className="button-group">
                    <div className="btn btn-later" onClick={() => setShow(false)}>
                        나중에 할게요
                    </div>
                    <div className="btn btn-go" onClick={() => {navigate(AUTH_PATH() + AUTH_ADD_INFOMATION_PATH()); setShow(false);}}>
                        아이 소개하러 가기
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PetMessage;