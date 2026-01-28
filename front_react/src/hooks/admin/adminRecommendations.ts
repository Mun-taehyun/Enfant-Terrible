// hooks/admin/daminRecommendations.ts


import { useMemo, useState } from "react";
import { 
  useAdminPopularRecoQuery, 
  useAdminRecoUpdateMutation, 
  useAdminUserRecoQuery 
} from "@/querys/admin/recommendation.query";

function toInt(v: string, fallback: number, min: number, max: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  const i = Math.floor(n);
  return Math.max(min, Math.min(max, i));
}

export type AdminRecoMode = "user" | "popular";

export function useAdminRecommendations() {
  const [mode, setMode] = useState<AdminRecoMode>("user");
  const [userIdText, setUserIdText] = useState<string>("1");
  const [limitText, setLimitText] = useState<string>("5");

  const userId = useMemo(() => toInt(userIdText, 1, 1, 9_999_999_999), [userIdText]);
  const limit = useMemo(() => toInt(limitText, 5, 1, 50), [limitText]);

  const userQuery = useAdminUserRecoQuery(userId, limit, mode === "user");
  const popularQuery = useAdminPopularRecoQuery(limit, mode === "popular");
  const updateMut = useAdminRecoUpdateMutation();

  const items = useMemo(() => {
    if (mode === "user") return userQuery.data?.results ?? [];
    return popularQuery.data?.results ?? [];
  }, [mode, userQuery.data, popularQuery.data]);

  const loading =
    userQuery.isFetching || popularQuery.isFetching || updateMut.isPending;

  const message = useMemo(() => {
    // 1. 에러가 발생한 경우 에러 메시지 우선 표시
    const err = userQuery.error ?? popularQuery.error ?? updateMut.error;
    if (err instanceof Error) return err.message;

    // 2. 업데이트 성공 시 메시지 처리 (data_summary 제거 버전)
    if (updateMut.data) {
      const d = updateMut.data;
      // 이전의 d.data_summary 관련 복잡한 로직을 삭제하고 기본 정보만 표시합니다.
      return `${d.status}: ${d.message}${d.updated_at ? ` / ${d.updated_at}` : ""}`;
    }

    // 3. 데이터 로드 완료 시 결과 건수 표시
    if (mode === "user" && userQuery.data) {
      return `유저 ${userQuery.data.user_id} 추천 ${userQuery.data.results.length}건`;
    }
    if (mode === "popular" && popularQuery.data) {
      return `인기 추천 ${popularQuery.data.results.length}건`;
    }

    return "";
  }, [mode, userQuery.data, popularQuery.data, userQuery.error, popularQuery.error, updateMut.data, updateMut.error]);

  async function refetch(): Promise<void> {
    if (mode === "user") await userQuery.refetch();
    else await popularQuery.refetch();
  }

  async function update(): Promise<void> {
    await updateMut.mutateAsync();
  }

  return {
    mode,
    setMode,
    userIdText,
    setUserIdText,
    limitText,
    setLimitText,
    userId,
    limit,

    items,
    loading,
    message,

    refetch,
    update,
  };
}