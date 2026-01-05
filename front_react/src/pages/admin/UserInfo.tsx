const UserInfo = () => {
  const users = [
    {
      id: 1,
      name: '최성민',
      email: 'admin@test.com',
      status: 'ACTIVE',
      joinDate: '2024-10-01',
    },
    {
      id: 2,
      name: '박종원',
      email: 'admin1@test.com',
      status: 'INACTIVE',
      joinDate: '2024-11-15',
    },
  ];

  return (
    <div>
      <h2>사용자 정보 조회</h2>
      <p>쇼핑몰에 가입한 사용자 정보를 조회합니다.</p>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th>ID</th>
            <th>이름</th>
            <th>이메일</th>
            <th>상태</th>
            <th>가입일</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.status}</td>
              <td>{user.joinDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  marginTop: '20px',
  borderCollapse: 'collapse',
};

export default UserInfo;