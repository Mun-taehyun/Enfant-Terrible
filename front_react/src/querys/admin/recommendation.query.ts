//src/query/admin/recommendation.query.ts

import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  DjangoPopularRecoResponse,
  DjangoRecoUpdateSuccess,
  DjangoUserRecoResponse,
} from "@/types/admin/recommendation";
import {
  adminUpdateRecommendations,
  getAdminPopularRecommendations,
  getAdminUserRecommendations,
} from "@/apis/admin/request/adminRecommendation.request";

export const adminRecoKeys = {
  all: ["admin", "recommendations"] as const,
  user: (userId: number, limit: number) => [...adminRecoKeys.all, "user", userId, limit] as const,
  popular: (limit: number) => [...adminRecoKeys.all, "popular", limit] as const,
};

export function useAdminUserRecoQuery(userId: number, limit: number, enabled: boolean) {
  return useQuery<DjangoUserRecoResponse>({
    queryKey: adminRecoKeys.user(userId, limit),
    queryFn: () => getAdminUserRecommendations(userId, limit),
    enabled,
    staleTime: 0,
  });
}

export function useAdminPopularRecoQuery(limit: number, enabled: boolean) {
  return useQuery<DjangoPopularRecoResponse>({
    queryKey: adminRecoKeys.popular(limit),
    queryFn: () => getAdminPopularRecommendations(limit),
    enabled,
    staleTime: 0,
  });
}

export function useAdminRecoUpdateMutation() {
  return useMutation<DjangoRecoUpdateSuccess, Error>({
    mutationFn: () => adminUpdateRecommendations(),
  });
}
