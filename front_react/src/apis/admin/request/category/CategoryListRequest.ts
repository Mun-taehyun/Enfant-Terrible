export interface CategoryListRequest {
  parent_id: number | string | null;
  depth: number | string | null;
  is_activated: boolean; 
}

/* 넣어야 되는 규칙 
parent_id?(카테고리의 계층 관계 구조의 중심축, 없으면 분류, 계층탐색불가)
depth?( 카테고리 단계 기준의 중심축, 카테고리 레벨을 직접 제어하는 필터 )
is_activated?(카테고리 활성화 여부 필터, 운영)
?를 넣는 이유: 필수 값이 아니기 때문에, 전체 조회 시에는 없어도 되기 때문
의미 없는 값, 백앤드에서 불필요한 값을 받지 않기 위해서
나머지를 안넣은 이유: 불필요한 필터링 옵션이기 때문에 
*/

