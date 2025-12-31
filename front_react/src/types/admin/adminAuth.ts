/*관리자 인증 타입*/
import type { AdminRoleType } from './adminRole';

export interface AdminAuth {
  email: string;
  role: AdminRoleType;
  accessToken: string;
  refreshToken?: string;
} 
/* AdminRoleType은 실행 시점에 존재하지 않는 “타입” 오직 컴파일(검증) 용도로만 사용*/
/* 관리자 인증 상태”의 데이터 구조 정의*/ 
/* 이메일: 문자열 * 로그인된 관리자의 이메일 관리자 식별의 기본 키, 백앤드에서 이메일 폼이나 형식을 지정/
/* 역할: 관리자의 권한 등급 */
/* 액세스 토큰: 문자열, 로그인 성공 시 발급되는 JWT / 세션 토큰 */
/* 리프레시 토큰: 선택적 문자열, 있을 수도, 없을 수도 있는 선택적 토큰 */

