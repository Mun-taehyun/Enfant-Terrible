import PetCard from "@/components/user/PetCard";
import { userQueries } from "@/querys/user/queryhooks";


//컴포넌트 : 유저 마이페이지 
export default function UserPage() {

    //서버상태 : 유저 정보 
    const { data: userData } = userQueries.useMe();
    //서버상태 : 펫 정보 
    const {data: petData} = userQueries.usePets();
    //서버상태 : 적립금 불러오기 

    //서버상태 : 주문내역 불러오기 

    //서버상태 : 내가 쓴 리뷰 불러오기 


    return (
        <div className="user-my-page-component">
            <div className="user-my-page-user-info-container">
                <div className="user-my-page-user-info-box">
                    <div className="user-my-page-user-info-welcome"></div>
                    <div className="user-my-page-user-info-update" onClick={onUserUpdateClickEventHandler}>{'회원정보 수정'}</div>
                </div>
                <div className="user-my-page-user-point">{'적립금 : 5000원'}</div>
            </div>
            <div className="user-my-page-user-pet-container">
                {petData !== null && petData !== undefined ?
                petData.petList.map((item) => <PetCard key={item.petId} pet={item} />) :
                <div className="error-pet-message"> 펫정보를 불러오기 실패했습니다. </div>
                }
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
                    <div className="user-my-page-user-delete" onClick={}>회원탈퇴</div>
                </div>
            </div>
        </div>
    );
}