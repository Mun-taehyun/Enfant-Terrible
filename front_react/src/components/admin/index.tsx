//components\admin\index.tsx

import { useState } from 'react';

import {
  useAdminAccountListQuery,
  useAdminAccountStatusMutation,
} from '@/hooks/admin/useAdminAccount';

import type { AdminAccountListRequest } from '@/types/admin/request/account/adminAccountRequest';

const AdminMemberPage = () => {
  const [params, setParams] = useState<AdminAccountListRequest>({
    page: 1,
    size: 10,
  });

  const { data, isLoading, isError, error } =
    useAdminAccountListQuery(params);

  const { mutate: changeStatus } =
    useAdminAccountStatusMutation();

  const handlePageChange = (newPage: number) => {
    setParams((prev) => ({
      ...prev,
      page: Math.max(1, newPage),
    }));
  };

  if (isLoading) {
    return <div style={{ padding: '20px' }}>데이터 로딩 중...</div>;
  }

  if (isError) {
    return (
      <div style={{ color: 'red', padding: '20px' }}>
        에러 발생: {error instanceof Error ? error.message : '알 수 없는 에러'}
      </div>
    );
  }

  const currentPage = params.page ?? 1;

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        관리자 회원 관리
      </h1>

      {/* 페이지네이션 */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          이전
        </button>

        <span>현재 페이지: {currentPage}</span>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
        >
          다음
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f4f4f4' }}>
            <th>ID</th>
            <th>이름</th>
            <th>이메일</th>
            <th>상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {data?.list.map((user) => (
            <tr key={user.userId}>
              <td>{user.userId}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td style={{ color: user.status === 'ACTIVE' ? 'blue' : 'red' }}>
                {user.status}
              </td>
              <td>
                <button
                  onClick={() => {
                    const nextStatus =
                      user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

                    if (window.confirm(`상태를 ${nextStatus}로 변경하시겠습니까?`)) {
                      changeStatus({
                        userId: user.userId,
                        status: nextStatus,
                      });
                    }
                  }}
                >
                  {user.status === 'ACTIVE' ? '정지' : '활성'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminMemberPage;
