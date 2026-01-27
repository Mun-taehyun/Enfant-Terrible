// src/hooks/admin/adminPoint.hook.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminPointKeys } from "@/querys/admin/adminPoint.query";
import {
  getAdminPointBalance,
  getAdminPointHistory,
  postAdminPointAdjust,
} from "@/apis/admin/request/adminPoint.request";

import type { AdminPageResponse } from "@/types/admin/api";
import type {
  AdminPointAdjustRequest,
  AdminPointBalanceResponse,
  AdminPointHistoryItem,
  AdminPointHistoryParams,
} from "@/types/admin/point";

export function useAdminPointBalance(userId: number | null) {
  return useQuery<AdminPointBalanceResponse, Error>({
    queryKey:
      userId == null
        ? ["admin", "points", "balance", "disabled"]
        : adminPointKeys.balance(userId),
    queryFn: async () => {
      if (userId == null) throw new Error("userId가 비어있습니다.");
      return getAdminPointBalance(userId);
    },
    enabled: userId != null,
    staleTime: 0,
  });
}

export function useAdminPointHistory(
  userId: number | null,
  params: AdminPointHistoryParams
) {
  return useQuery<AdminPageResponse<AdminPointHistoryItem>, Error>({
    queryKey:
      userId == null
        ? ["admin", "points", "history", "disabled"]
        : adminPointKeys.history(userId, params),
    queryFn: async () => {
      if (userId == null) throw new Error("userId가 비어있습니다.");
      return getAdminPointHistory(userId, params);
    },
    enabled: userId != null,
    staleTime: 0,

    // ✅ TanStack Query v5: keepPreviousData 옵션 없음
    // 이전 데이터를 유지하려면 placeholderData로 prev 그대로 반환
    placeholderData: (prev) => prev,
  });
}

export function useAdminPointAdjust() {
  const qc = useQueryClient();

  return useMutation<null, Error, { userId: number; body: AdminPointAdjustRequest }>({
    mutationFn: async ({ userId, body }) => {
      return postAdminPointAdjust(userId, body);
    },
    onSuccess: async (_data, variables) => {
      await qc.invalidateQueries({ queryKey: adminPointKeys.balance(variables.userId) });
      await qc.invalidateQueries({ queryKey: adminPointKeys.all });
    },
  });
}
