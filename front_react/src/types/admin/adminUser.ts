/*관리자 사용자 타입*/
import type { AdminRoleType } from './adminRole';

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRoleType;
  status: 'ACTIVE' | 'BLOCKED';
  createdAt: string;
  lastLoginAt?: string;
}

/* 관리자 사용자의 데이터 구조 정의 */
/* ID: 문자열, 관리자의 고유 식별자 */
/* 이메일: 문자열, 관리자의 이메일 주소 */
/* 역할: AdminRoleType, 관리자의 권한 등급 */
/* 상태: 'ACTIVE' | 'BLOCKED', 관리자의 현재 상태 */
/* 생성일: 문자열, 관리자가 생성된 날짜와 시간 */
/* 마지막 로그인일: 선택적 문자열, 관리자가 마지막으로 로그인한 날짜와 시간 (있을 수도, 없을 수도 있음) */