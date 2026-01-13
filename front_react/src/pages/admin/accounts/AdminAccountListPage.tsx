//pages\admin\accounts\adminaccountlistpage.tsx

import { useState } from 'react'; 
import { useNavigate } from 'react-router-dom';

// ✅ 에러 해결: @/ 별칭 대신 상대 경로를 사용하여 Vite의 500 에러를 방지합니다.
// 아래 경로는 파일 위치(src/pages/admin/accounts)를 기준으로 src/hooks까지 거슬러 올라간 경로입니다.
import { useAdminAccountListQuery } from '../../../hooks/admin/useAdminAccount';
import type { AdminAccountListRequest } from '../../../types/admin/request/account/adminAccountRequest';
import type { MemberStatus } from '../../../components/common/codes';

// ✅ 데이터 타입 정의: any를 제거하여 안정성을 높였습니다.
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
  
  // ✅ 타입 캐스팅 및 초기 상태 설정
  const [params] = useState<AdminAccountListRequest>({
    page: 1, 
    size: 20, 
    name: '', 
    email: '', 
    status: undefined as unknown as MemberStatus,
    provider: 'LOCAL', 
    createdFrom: '', 
    createdTo: '',
  });

  // ✅ 데이터 호출 (Hook 연결)
  const { data, isLoading } = useAdminAccountListQuery(params);
  
  // ✅ any 대신 인터페이스 적용
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
            {/* ✅ account: AdminAccount 타입을 명시하여 안정성 확보 */}
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