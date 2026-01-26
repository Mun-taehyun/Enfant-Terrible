import { recoAxios } from "@/apis/admin/reco_axios";
import type {
  DjangoPopularRecoResponse,
  DjangoRecoUpdateSuccess,
  DjangoUserRecoResponse,
} from "@/types/admin/recommendation";
import {
  parsePopularRecoResponse,
  parseRecoUpdateResponse,
  parseUserRecoResponse,
} from "@/apis/admin/response/adminRecommendation.response";

function assertRecoBaseUrl(): void {
  const base = import.meta.env.VITE_RECO_API_BASE_URL;
  if (!base || base.trim().length === 0) {
    throw new Error("주소가 아직 설정되지 않았습니다.");
  }
}

export async function getAdminUserRecommendations(userId: number, limit: number): Promise<DjangoUserRecoResponse> {
  assertRecoBaseUrl();
  const { data } = await recoAxios.get(`/api/recommendations/${userId}/`, { params: { limit } });
  return parseUserRecoResponse(data);
}

export async function getAdminPopularRecommendations(limit: number): Promise<DjangoPopularRecoResponse> {
  assertRecoBaseUrl();
  const { data } = await recoAxios.get(`/api/recommendations/popular/`, { params: { limit } });
  return parsePopularRecoResponse(data);
}

/**
 * 준비 단계에서는 GET로 둡니다.
 * (장고에서 메서드 제한이 없으면 GET/POST 모두 들어오며, POST는 CSRF로 막힐 수 있어서)
 */
export async function adminUpdateRecommendations(): Promise<DjangoRecoUpdateSuccess> {
  assertRecoBaseUrl();
  const { data } = await recoAxios.get(`/api/admin/recommendation/update/`);
  return parseRecoUpdateResponse(data);
}
