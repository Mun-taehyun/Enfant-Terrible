import { useQuery } from '@tanstack/react-query';
import { adminMemberKeys } from './adminMemberQueryKeys';
// 🔽 API 함수명은 관례에 따라 getAdminMemberDetail로 설정했습니다.
import { getAdminMemberDetail } from '@/apis/admin/request/member/adminMember.api.ts';

// 상세 응답 타입이 아직 없다면 임시로 인터페이스를 정의하거나 Account 타입을 활용하세요.
interface AdminMemberDetailResponse {
  userId: number;
  name: string;
  email: string;
  status: string;
  // ... 추가 필요한 필드들
}

/**
 * ✅ 관리자 회원 상세 조회 훅
 */
export const useAdminMemberDetailQuery = (userId: number | null) => {
  return useQuery<AdminMemberDetailResponse>({
    // adminMemberKeys.detail 키 활용
    queryKey: adminMemberKeys.detail(userId as number),
    queryFn: () => getAdminMemberDetail(userId as number),
    // userId가 있을 때만 실행하여 에러 방지
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });
};