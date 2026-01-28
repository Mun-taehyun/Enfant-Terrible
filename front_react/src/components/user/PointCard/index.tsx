import { PointHistoryResponseDto } from "@/apis/user/response/point";
import { getPointTypeLabel, isPlusByType } from "@/constant/user/point.index";

interface Props {
    item: PointHistoryResponseDto;
}

//컴포넌트 : 포인트 내역 조회 1열
export default function PointHistoryItem({ item }: Props) {

    const {
        pointType, pointAmount , reason , createdAt
    } = item;


  const isPlus = isPlusByType(pointType, pointAmount);

  return (
    <div className="point-history-item">
      {/* 좌측 정보 */}
      <div className="point-history-info">
        <div className="point-history-reason">
          {reason}
          <span className="point-history-type">
            {' · '}
            {getPointTypeLabel(pointType)}
          </span>
        </div>

        <div className="point-history-date">
          {new Date(createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* 우측 포인트 */}
      <div
        className={`point-history-amount ${isPlus ? 'plus' : 'minus'}`}
      >
        {isPlus ? '+' : '-'}
        {Math.abs(pointAmount).toLocaleString()} P
      </div>
    </div>
  );
};


// public enum PointType {
//   EARN,                      적립
//   USE,                       사용
//   EXPIRE,                    만료
//   ADJUST                     조정
// }