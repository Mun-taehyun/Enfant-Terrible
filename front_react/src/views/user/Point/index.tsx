import Pagination from "@/components/user/Pagination";
import PointHistoryItem from "@/components/user/PointCard";
import { useProduct } from "@/hooks/user/product/use-product.hook";
import { pointQueries } from "@/querys/user/queryhooks";
import './style.css';


export default function PointHistoryPage() {
    const {searchParams} = useProduct();
    const {data:pointHistoryData} = pointQueries.useHistory( Number(searchParams.get("page")) , 5);

  return (
    <div className="point-history-page">
      {/* 타이틀 */}
      <h2 className="point-history-title">포인트 내역</h2>

      {/* 리스트 */}
      <div className="point-history-list">
        {pointHistoryData?.length === 0 ? (
          <div className="point-history-empty">
            포인트 내역이 없습니다.
          </div>
        ) : (
          pointHistoryData?.map((item) => (
            <PointHistoryItem
              key={item.pointHistoryId}
              item={item}
            />
          ))
        )}
      </div>

      {/* 페이지네이션 (네가 만든 거 그대로) */}
      <Pagination totalCount={pointHistoryData?.length} />
    </div>
  );
}