/**
 * @description 관리자 - 계정 관리 API 세트 (이미지 7, 9번 명세 기준)
 */
// 1. @/apis/core 대신 상대 경로로 직접 연결
import api from '../../core/api/axiosInstance.ts';

// 2. 공통 코드 (src/components/common/codes.ts)
import type { MemberStatus } from '../../../components/common/codes';

// 3. 요청 타입 (src/types/admin/request/account/adminAccountRequest.ts)
import type { AdminAccountListRequest } from '../../../types/admin/request/account/adminAccountRequest';

// 4. 응답 타입 (src/types/admin/response/account/adminAccountResponse.ts)
import type { 
  AdminAccountListResponse, 
  AdminAccountDetailResponse 
} from '../../../types/admin/response/account/adminAccountResponse';

/**
 * @description 6. 계정 목록 조회
 */
export const getAdminAccountList = async (params: AdminAccountListRequest) => {
  const { data } = await api.get<AdminAccountListResponse>('/admin/users', { params });
  return data;
};

/**
 * @description 7. 계정 상세 조회
 */
export const getAdminAccountDetail = async (userId: number) => {
  const { data } = await api.get<AdminAccountDetailResponse>(`/admin/users/${userId}`);
  return data;
};

/**
 * @description 8. 계정 상태 변경
 */
export const patchAdminAccountStatus = async (userId: number, status: MemberStatus) => {
  await api.patch(`/admin/users/${userId}/status`, { status });
};