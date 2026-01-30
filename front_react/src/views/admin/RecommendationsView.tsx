// src/views/admin/RecommendationsView.tsx
import styles from "./RecommendationsView.module.css";
import { useAdminRecoUpdateMutation } from "@/querys/admin/recommendation.query";

export default function RecommendationsView() {
  const updateMut = useAdminRecoUpdateMutation();
  const loading = updateMut.isPending;

  const message = (() => {
    if (updateMut.error instanceof Error) return updateMut.error.message;
    if (updateMut.data) {
      const d = updateMut.data;
      return `${d.status}: ${d.message}${d.updated_at ? ` / ${d.updated_at}` : ""}`;
    }
    return "";
  })();

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>추천 관리</h1>

      <div className={styles.panel}>
        <div className={styles.row}>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => {
              void updateMut.mutateAsync();
            }}
            disabled={loading}
          >
            추천 테이블 갱신
          </button>
        </div>

        <div className={styles.msg}>{loading ? "로딩 중..." : message}</div>
      </div>
    </div>
  );
}
