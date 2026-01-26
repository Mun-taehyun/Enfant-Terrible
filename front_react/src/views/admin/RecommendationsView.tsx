// src/views/admin/RecommendationsView.tsx
import React from "react";
import styles from "./RecommendationsView.module.css";
import { useAdminRecommendations } from "@/hooks/admin/adminRecommendations";

export default function RecommendationsView() {
  const {
    mode,
    setMode,
    userIdText,
    setUserIdText,
    limitText,
    setLimitText,
    items,
    loading,
    message,
    refetch,
    update,
  } = useAdminRecommendations();

  const onChangeUserId = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserIdText(e.target.value);
  };

  const onChangeLimit = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLimitText(e.target.value);
  };

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>추천 관리</h1>


      <div className={styles.panel}>
        <div className={styles.row}>
          <label className={styles.label}>모드</label>
          <div className={styles.segment}>
            <button
              type="button"
              className={`${styles.segBtn} ${mode === "user" ? styles.segActive : ""}`}
              onClick={() => setMode("user")}
              disabled={loading}
            >
              사용자
            </button>

            <button
              type="button"
              className={`${styles.segBtn} ${mode === "popular" ? styles.segActive : ""}`}
              onClick={() => setMode("popular")}
              disabled={loading}
            >
              인기
            </button>
          </div>
        </div>

        <div className={styles.row}>
          <label className={styles.label}>사용자Id</label>
          <input
            className={styles.input}
            value={userIdText}
            onChange={onChangeUserId}
            disabled={loading || mode !== "user"}
            inputMode="numeric"
          />

          <label className={styles.label}> 추천 수</label>
          <input
            className={styles.input}
            value={limitText}
            onChange={onChangeLimit}
            disabled={loading}
            inputMode="numeric"
          />

          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => {
              void refetch();
            }}
            disabled={loading}
          >
            조회
          </button>

          <button
            type="button"
            className={styles.ghostBtn}
            onClick={() => {
              void update();
            }}
            disabled={loading}
          >
            추천 갱신
          </button>
        </div>

        <div className={styles.msg}>{loading ? "로딩 중..." : message}</div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>순번</th>
              <th>제품Id</th>
              <th>score</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={3} className={styles.empty}>
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              items.map((it, idx) => (
                <tr key={`${it.productId}-${idx}`}>
                  <td>{idx + 1}</td>
                  <td>{it.productId}</td>
                  <td>{it.score.toFixed(4)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
