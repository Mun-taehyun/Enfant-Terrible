/**
 * @description 시스템 전반에서 사용하는 공통 코드 및 타입 정의 (사진 8번 기준)
 */

// 회원 권한
export type UserRole = 'USER' | 'ADMIN';

// 회원 상태
export type MemberStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

// 소셜 로그인 제공자
export type SocialProvider = 'LOCAL' | 'GOOGLE' | 'NAVER';

// 성별
export type Gender = 'M' | 'F';

// 활동 레벨
export type ActivityLevel = 1 | 2 | 3; // 1:실내, 2:중간, 3:야외

/*"오타로 인한 버그를 원천 차단하고, 나중에 상태값 하나가 바뀌더라도 
단 1초 만에 전체 수정을 끝낼 수 있는 '안전 장치'를 만든 것 */