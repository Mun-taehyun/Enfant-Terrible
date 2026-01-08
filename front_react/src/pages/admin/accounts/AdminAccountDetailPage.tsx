import { useParams, useNavigate } from 'react-router-dom';
import { 
  useAdminAccountDetailQuery, 
  useAdminAccountStatusMutation 
} from '@/hooks/queries/admin/useAdminAccount'; // ✅ 통합 훅 사용
import type { MemberStatus } from '@/components/common/codes';

const AdminAccountDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = Number(id);

  const { data: account, isLoading, isError } = useAdminAccountDetailQuery(userId);
  const { mutate: changeStatus } = useAdminAccountStatusMutation();

  const handleStatusChange = (status: MemberStatus) => {
    if (!userId) return;
    if (window.confirm(`${status} 상태로 변경하시겠습니까?`)) {
      changeStatus({ userId, status });
    }
  };

  if (isLoading) return <div className="p-6">상세 정보 로딩 중...</div>;
  if (isError || !account) return <div className="p-6 text-red-500">데이터를 찾을 수 없습니다.</div>;

  return (
    <div className="admin-container p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">계정 상세 정보</h2>
        <button onClick={() => navigate(-1)} className="border px-3 py-1 rounded">뒤로가기</button>
      </div>
      <div className="bg-white p-6 rounded shadow grid grid-cols-2 gap-4">
        <div><label className="text-gray-400 text-sm">이름</label><p className="font-medium">{account.name}</p></div>
        <div><label className="text-gray-400 text-sm">이메일</label><p className="font-medium">{account.email}</p></div>
        <div><label className="text-gray-400 text-sm">상태</label><p className="font-medium text-blue-600">{account.status}</p></div>
        <div><label className="text-gray-400 text-sm">가입 유형</label><p className="font-medium">{account.provider}</p></div>
      </div>
      <div className="mt-8 flex gap-2">
        <button onClick={() => handleStatusChange('ACTIVE')} className="bg-green-500 text-white px-4 py-2 rounded">활성화</button>
        <button onClick={() => handleStatusChange('SUSPENDED')} className="bg-red-500 text-white px-4 py-2 rounded">정지</button>
      </div>
    </div>
  );
};

// ✅ 함수 중괄호(}) 밖으로 이동 완료
export default AdminAccountDetailPage;
