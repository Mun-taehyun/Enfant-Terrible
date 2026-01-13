import { useState } from 'react';

const AdminMyPage = () => {
  // 🔹 관리자 정보 (추후 API로 교체)
  const [adminInfo, setAdminInfo] = useState({
    loginId: 'admin01',
    name: '관리자',
    email: 'admin@test.com',
    password: '',
    passwordConfirm: '',
    profileImage: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setAdminInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // TODO: axios PUT /api/admin/me
    alert('관리자 정보가 저장되었습니다.');
  };

  return (
    <div style={{ maxWidth: '640px' }}>
      <h2 style={{ marginBottom: '8px' }}>관리자 마이페이지</h2>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>
        관리자 계정 정보를 수정할 수 있습니다.
      </p>

      {/* 🔹 프로필 이미지 */}
      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>프로필 이미지</label>
        <input type="file" />
      </div>

      {/* 🔹 아이디 */}
      <div style={fieldStyle}>
        <label style={labelStyle}>아이디</label>
        <input
          type="text"
          value={adminInfo.loginId}
          disabled
          style={inputStyle}
        />
      </div>

      {/* 🔹 이름 */}
      <div style={fieldStyle}>
        <label style={labelStyle}>이름</label>
        <input
          type="text"
          name="name"
          value={adminInfo.name}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      {/* 🔹 이메일 */}
      <div style={fieldStyle}>
        <label style={labelStyle}>이메일</label>
        <input
          type="email"
          name="email"
          value={adminInfo.email}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      {/* 🔹 비밀번호 변경 */}
      <div style={fieldStyle}>
        <label style={labelStyle}>새 비밀번호</label>
        <input
          type="password"
          name="password"
          value={adminInfo.password}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>비밀번호 확인</label>
        <input
          type="password"
          name="passwordConfirm"
          value={adminInfo.passwordConfirm}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      {/* 🔹 저장 버튼 */}
      <div style={{ marginTop: '32px' }}>
        <button
          onClick={handleSave}
          style={{
            padding: '10px 16px',
            backgroundColor: '#5aa6c9',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          저장
        </button>
      </div>
    </div>
  );
};

/* ======================
   Styles
====================== */

const fieldStyle = {
  marginBottom: '16px',
};

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '13px',
  fontWeight: 600,
};

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: '4px',
  border: '1px solid #cbd5e1',
  fontSize: '14px',
};

export default AdminMyPage;