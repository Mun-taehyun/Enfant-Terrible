import { Routes, Route, Navigate } from 'react-router-dom';
import UserContainer from './containers/UserContainer';
import AdminContainer from './containers/AdminContainer';

export default function App() {
  return (
    <Routes>
      {/* 기본 접속 시 유저로 보내기 */}
      <Route path="/" element={<Navigate to="/user" replace />} />

      {/* User 영역 */}
      <Route path="/user/*" element={<UserContainer />} />

      {/* Admin 영역 */}
      <Route path="/admin/*" element={<AdminContainer />} />
    </Routes>
  );
}
