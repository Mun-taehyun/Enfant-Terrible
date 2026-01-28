import ReviewItem from "@/types/user/interface/review.interface";
import dayjs from "dayjs";

interface Props {
    props : ReviewItem;
}


//컴포넌트 : 리뷰 
export default function ReviewCard ({props} : Props) {

    //속성 : 리뷰 속성
    const { userId , rating, content, createdAt , updatedAt} = props;

    //함수 : 작성일 경과시간 
    const getElapsedTime = () => {
        const now = dayjs().add(9, 'hour');
        //현재(미국)시간 객체 dayjs()를 한국시간으로 보정
        const writeTime = dayjs(createdAt);
        //dayjs 객체로 변환 => 이용 

        const gap = now.diff(writeTime, 's');
        //(비교대상 ,  초단위..)
        if (gap < 60) return `${gap}초 전`;
        if (gap < 3600) return `${Math.floor(gap/60)}분 전`;
        if (gap < 86400) return `${Math.floor(gap/3600)}시간 전`;
        return `${Math.floor(gap/86400)}일 전`;
        //Math.floor 로 소숫점제거.. 
    }

    //렌더 : 리뷰
    return (
        <div className="review-card-container">
            {/* 1. 헤더: 유저명 및 작성 시간 */}
            <div className="review-header">
                <span className="review-user-name">user_{userId}</span>
                <span className="review-divider">•</span>
                <span className="review-time">{getElapsedTime()}</span>
            </div>

            {/* 2. 별점: 시각적 점수 표시 */}
            <div className="review-rating-bar">
                <span className="stars-active">{"★".repeat(rating)}</span>
                <span className="stars-inactive">{"☆".repeat(5 - rating)}</span>
            </div>

            {/* 3. 본문: 리뷰 내용 */}
            <div className="review-body">
                <p className="review-text">{content}</p>
            </div>
            
            {/* 4. 푸터: 수정 여부 (조건부 렌더링) */}
            {createdAt !== updatedAt && (
                <div className="review-footer">
                <span className="review-edited-tag">수정됨</span>
                </div>
            )}
        </div>

  );
};
