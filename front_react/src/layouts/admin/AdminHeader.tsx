// layouts/admin/AdminHeader.tsx
import { useNavigate } from 'react-router-dom';

const AdminHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/admin/login');
  };

  return (
    <header
      style={{
        height: '48px',
        backgroundColor: '#5aa6c9',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '0 16px',
        color: '#fff',
        fontSize: '13px',
      }}
    >
      <span style={{ marginRight: '12px' }}>관리자님</span>
      <button
        onClick={handleLogout}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        로그아웃
      </button>
    </header>
  );
};

export default AdminHeader;