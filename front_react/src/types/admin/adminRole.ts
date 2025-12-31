/*관리자 권한 타입*/

export type AdminRoleType =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'MANAGER';

  /*특정 타입 규칙을 연결을 이 타입을 다른 파일에 할 수 있도록 공개 할당*/
  /*| 유니온 타입(or: 3개중 하나), 이 필드는 다음 유니온에 포함된 값만 가질 수 있음 */