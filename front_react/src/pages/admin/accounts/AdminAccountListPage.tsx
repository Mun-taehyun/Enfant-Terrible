import { useState } from 'react'; // ✅ React 제거하여 경고 해결
import { useNavigate } from 'react-router-dom';
import { useAdminAccountListQuery } from '@/hooks/queries/admin/useAdminAccount';
import type { AdminAccountListRequest } from '@/types/admin/request/account/adminAccountRequest';
import type { MemberStatus } from '@/components/common/codes';

// ✅ 1. 데이터 타입을 정의하여 any를 대체합니다.
interface AdminAccount {
  id: number;
  name: string;
  status: string;
  email?: string;
}

interface AdminAccountListResponse {
  content: AdminAccount[];
}

const AdminAccountListPage = () => {
  const navigate = useNavigate();
  
  const [params] = useState<AdminAccountListRequest>({
    page: 1, size: 20, name: '', email: '', 
    status: undefined as unknown as MemberStatus,
    provider: 'LOCAL', createdFrom: '', createdTo: '',
  });

  const { data, isLoading } = useAdminAccountListQuery(params);
  
  // ✅ 2. any 대신 정의한 인터페이스로 타입 캐스팅
  const responseData = data as AdminAccountListResponse | undefined;
  const accountList = responseData?.content || [];

  if (isLoading) return <div className="p-6 text-center">목록 로딩 중...</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">계정 관리 목록</h2>
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">이름</th>
              <th className="p-4">상태</th>
            </tr>
          </thead>
          <tbody>
            {/* ✅ 3. account: any를 account: AdminAccount로 변경 */}
            {accountList.map((account: AdminAccount) => (
              <tr 
                key={account.id} 
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/admin/account/${account.id}`)}
              >
                <td className="p-4 text-sm text-gray-500">{account.id}</td>
                <td className="p-4 font-medium text-blue-600">{account.name}</td>
                <td className="p-4 text-sm">{account.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAccountListPage;