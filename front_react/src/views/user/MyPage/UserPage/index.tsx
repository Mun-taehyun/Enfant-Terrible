import PetCard from "@/components/user/PetCard";
import { useAuth } from "@/hooks/user/auth/use-sign.hook";
import { userQueries } from "@/querys/user/queryhooks";
import './style.css';
import { usePet } from "@/hooks/user/pet/pet.hook";
import { useNavigate } from "react-router-dom";
import { AUTH_ADD_INFOMATION_PATH, AUTH_PATH, MAIN_PATH, USER_PATH, USER_UPDATE_PATH } from "@/constant/user/route.index";


//컴포넌트 : 유저 마이페이지 
export default function UserPage() {

    //커스텀 훅: 유저 정보 / 시스템 
    const {
        myInfo,onUserDeleteEventHandler
    } = useAuth();

    //커스텀 훅: 펫 등록
    const {
        scrollRef, showLeftBtn, handleScroll, onPetScrollHandler
    } = usePet();

    //서버상태 : 펫 정보 
    const {data: petData , isError} = userQueries.usePets();
    //서버상태 : 적립금 불러오기 

    //서버상태 : 주문내역 불러오기 

    //서버상태 : 내가 쓴 리뷰 불러오기 

    //함수 : 네비게이트 
    const navigate = useNavigate();


    //이벤트핸들러 : 펫 등록할 페이지로 이동 
    const onPetRegisterButtonHandler = () => {
        navigate(AUTH_PATH() + AUTH_ADD_INFOMATION_PATH());
    }

    //이벤트핸들러 : 유저정보 수정 페이지 이동 이벤트 처리 
    const onUserUpdatePageButtonHandler = () => {
        navigate(myInfo ? USER_PATH() + USER_UPDATE_PATH(myInfo.userId) : MAIN_PATH());
    }

    if(!myInfo) return;
    return (
        <div className="user-my-page-component">
            <div className="user-my-page-user-info-container">
                <div className="user-my-page-user-info-box">
                    <div className="user-my-page-user-info-welcome">{myInfo.name}님 반갑습니다</div>
                    <div className="user-my-page-user-info-update" onClick={onUserUpdatePageButtonHandler}>{'회원정보 수정'}</div>
                </div>
                <div className="user-my-page-user-point">{'적립금 : 5000원'}</div>
            </div>
            <div className="user-my-page-user-pet-container">
                {/* 별도로 구현된 스크롤 버튼 */}
                {showLeftBtn && (
                    <button className="scroll-btn left" onClick={() => onPetScrollHandler('left')}>‹</button>
                )}
                
                {/* 실제 스크롤이 일어나는 리스트 영역 */}
                <div 
                    className="pet-list-scroll-area" 
                    ref={scrollRef} 
                    onScroll={handleScroll}
                >
                    {!isError && petData !== undefined ? (
                        petData.map((item) => <PetCard key={item.petId} pet={item} />)
                    ) : (
                        <div className="error-pet-message"> 펫정보를 불러오기 실패했습니다. 펫을 등록해주세요. </div>
                    )}
                </div>

                <button className="scroll-btn right" onClick={() => onPetScrollHandler('right')}>›</button>

                {/* 중앙 하단 등록 버튼 */}
                <div className="user-my-page-user-pet-register-button" onClick={onPetRegisterButtonHandler}>
                    펫 등록
                </div>
            </div>
            <div className="user-my-page-user-order-container">
                <div className="user-my-page-user-order-box">
                    <div className="user-my-page-user-order-title"> 주문내역 </div>
                    {/* {여기에 주문 내역을 넣을 예정} */}
                </div>
                <div className="user-my-page-user-review-box">
                    <div className="user-my-page-user-review-title"> 상품 리뷰 내역 </div>
                    {/* {여기에 리뷰 내역을 넣을 예정} */}
                </div>
                <div className="user-my-page-user-product-inquiry-box">
                    <div className="user-my-page-user-product-inquiry-title"> 상품 문의 내역 </div>
                    {/* {여기에 상품문의 내역을 넣을 예정} */}
                </div>
            </div>
            <div className="user-my-page-user-other-container">
                <div className="user-my-page-user-control-box">
                    <div className="user-my-page-user-delete" onClick={onUserDeleteEventHandler}>회원탈퇴</div>
                </div>
            </div>
        </div>
    );
}