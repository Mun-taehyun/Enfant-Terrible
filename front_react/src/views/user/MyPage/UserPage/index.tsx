import PetCard from "@/components/user/PetCard";
import { useAuth } from "@/hooks/user/auth/use-sign.hook";
import { orderQueries, pointQueries, reviewQueries, userQueries } from "@/querys/user/queryhooks";
import './style.css';
import { usePet } from "@/hooks/user/pet/pet.hook";
import { useNavigate } from "react-router-dom";
import { AUTH_ADD_INFOMATION_PATH, AUTH_PATH, MAIN_PATH, POINT_PATH, USER_PATH, USER_UPDATE_PATH } from "@/constant/user/route.index";
import ReviewCard from "../../Product/ProductReview";
import Pagination from "@/components/user/Pagination";
import { useProduct } from "@/hooks/user/product/use-product.hook";
import { OrderList } from "@/components/user/Order/OrderList";
import { inquiryQueries } from "@/querys/user/queryhooks/inquiry.query";
import InquiryBox from "@/components/user/Inquiry";
import { useLoginUserStore } from "@/stores/user";
import { useState } from "react";


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

    //커스텀 훅 : url 정보
    const { searchParams , product} = useProduct();


    //서버상태 : 펫 정보 
    const {data: petData , isError} = userQueries.usePets();
    //서버상태 : 적립금 불러오기 
    const {data: pointData} = pointQueries.useBalance();
    //서버상태 : 주문내역 불러오기 
    const {data: orderData} = orderQueries.useGetOrderMy(Number(searchParams.get("page")), 5);
    //서버상태 : 내가 쓴 리뷰 불러오기 
    const {data: reviewData} = reviewQueries.useGetReviews(product, Number(searchParams.get("page")) , 5);
    //서버상태 : 내가 쓴 문의 불러오기 
    const {data: inquiryData} = inquiryQueries.useGetInquiries(product, Number(searchParams.get("page")) , 5)
    //서버상태 : 내가 쓴 문의 삭제하기 
    const { mutate: deleteInquiry } = inquiryQueries.useDeleteInquiry(product);
    //서버상태 : 내가 쓴 리뷰 삭제하기 
    const { mutate: deleteReview } = reviewQueries.useDeleteReview(product);
    //서버상태 : 주문상세내역에서 정보 가져오기 
    const { data: detailOrder} = orderQueries.useGetOrderMyDetail(product);
    //서버상태 : 내가 산 주문내역에서 취소하기 
    const { mutate: cancelOrder , isPending } = orderQueries.usePostOrderMyCancel();


    //함수 : 네비게이트 
    const navigate = useNavigate();
    //상태보관 : 유저
    const {loginUser} = useLoginUserStore();
    

    //이벤트핸들러 : 펫 등록할 페이지로 이동 
    const onPetRegisterButtonHandler = () => {
        navigate(AUTH_PATH() + AUTH_ADD_INFOMATION_PATH());
    }

    //이벤트핸들러 : 유저정보 수정 페이지 이동 이벤트 처리 
    const onUserUpdatePageButtonHandler = () => {
        navigate(myInfo ? USER_PATH() + USER_UPDATE_PATH(myInfo.userId) : MAIN_PATH());
    }

    //이벤트핸들러 : 포인트 히스토리 이동 이벤트 처리 
    const onPointPageButtonHandler = () => {
        navigate(myInfo ? POINT_PATH(myInfo.userId) : MAIN_PATH());
    }

    //이벤트핸들러 : 리뷰 삭제
    const onReviewDelete = (reviewId : number) => {
        const accessToken = localStorage.getItem("accessToken");
        if(!reviewData || !loginUser || accessToken) return;
        if (window.confirm("정말 이 문의를 삭제하시겠습니까?")) {
            deleteReview( (reviewId), 
                {
                onSuccess: () => {
                    alert("삭제되었습니다.");
                }
            });
        } 
    }

    //이벤트핸들러 : 문의 삭제 
    const onInquiryDelete = () => {
        const accessToken = localStorage.getItem("accessToken");
        if(!inquiryData || !loginUser || accessToken) return;
        if (window.confirm("정말 이 문의를 삭제하시겠습니까?")) {
                deleteInquiry( inquiryData.inquiryId, {
                onSuccess: () => {
                    alert("삭제되었습니다.");
                }
            });
        }        
    }
    const [step, setStep] = useState<'IDLE' | 'FORM'>('IDLE');
    const [reason, setReason] = useState<string>('');
    const isCancelable = detailOrder?.status === 'PAID' || detailOrder?.status === 'PREPARING';

    //이벤트핸들러 : 주문 취소하기
    const handleCancelRequest = (orderId : number) => {
        if(orderId === 0) return;
        if (!isCancelable) {
            alert("배송이 시작된 상품은 취소가 불가능합니다. 고객센터로 문의해주세요.");
            return;
        }

        if (window.confirm("정말 주문을 취소하시겠습니까?")) {
        // DTO 구조에 맞춰서 전달 (사유 등은 일단 빈값이나 기본값)
        const requestBody = {reason : reason};

        cancelOrder({ orderId, requestBody }, {
            onSuccess: () => {
            alert("주문 취소가 완료되었습니다.");
            }
        });
        }
    };

    if(!myInfo) return;
    return (
        <div className="user-my-page-component">
            <div className="user-my-page-user-info-container">
                <div className="user-my-page-user-info-box">
                    <div className="user-my-page-user-info-welcome">{myInfo.name}님 반갑습니다</div>
                    <div className="user-my-page-user-info-update" onClick={onUserUpdatePageButtonHandler}>{'회원정보 수정'}</div>
                </div>
                <div className="user-my-page-user-point" onClick={onPointPageButtonHandler}>{pointData?.balance}</div>          
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
                    {orderData ? orderData.items.map((item) => (
                        <>
                        <OrderList key={item.orderId} item={item} />
                        {step === 'IDLE' ? (
                            // [1단계] 단순 취소 버튼
                            <button className="btn-open-form" onClick={() => setStep('FORM')}>
                                주문 취소하기
                            </button>
                             ) : (
                            // [2단계] 사유 입력 폼 (상태값 변화에 의해 나타남)
                            <div className="cancel-form-box">
                                <div className="form-title">취소 사유를 알려주세요 🐾</div>
                                <textarea 
                                    className="cancel-textarea"
                                    placeholder="단순 변심, 사이즈 착오 등 사유를 적어주세요."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                                <div className="form-btns">
                                    <button className="btn-back" onClick={() => setStep('IDLE')}>이전</button>
                                    <button 
                                        className="btn-confirm" 
                                        onClick={() =>handleCancelRequest(detailOrder ? detailOrder.orderId : 0)}
                                        disabled={isPending}
                                        >
                                        {isPending ? "처리중..." : "확인"}
                                    </button>
                                </div>
                            </div>
                        )}
                        </>
                    )) : //주문내역 리스트.. 
                        <div> 주문 내역이 없습니다.</div>
                    }
                </div>
                <div className="user-my-page-user-review-box">
                    <div className="user-my-page-user-review-title"> 상품 리뷰 내역 </div>
                    {reviewData ? reviewData?.reviewList.map((item) => (//리뷰 목록 렌더링
                        <>
                        <ReviewCard key={item.reviewId} props={item} />
                        <div className="user-my-page-user-product-review-delete-button" onClick={() => onReviewDelete(item.reviewId)}>삭제</div>
                        </>
                    )) : "리뷰가 존재하지 않습니다"
                    }
                    <div className="pagination-review">
                        <Pagination totalCount={reviewData?.reviewList.length} />
                    </div>
                </div>
                <div className="user-my-page-user-product-inquiry-box">
                    <div className="user-my-page-user-product-inquiry-title"> 상품 문의 내역 </div>                    
                    {inquiryData ? inquiryData.inquiryList.map( (item) => (
                        <>
                        <InquiryBox key={item.inquiryId} item={item} />
                        <div className="user-my-page-user-product-inquiry-delete-button" onClick={onInquiryDelete}>삭제</div>
                        </>
                    )):
                    <div> 문의 내역이 존재하지 않습니다. </div>
                    }
                    <div className="pagination-review">
                        <Pagination totalCount={inquiryData?.inquiryList.length} />
                    </div>
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