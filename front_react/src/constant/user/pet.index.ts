export const BREED_DATA: Record<string, string[]> = {
    'DOG': [
        '말티즈', '푸들', '포메라니안', '비숑 프리제', '시바견', 
        '골든 리트리버', '진돗개', '치와와', '닥스훈트', '요크셔 테리어', '프렌치 불독'
    ],
    'CAT': [
        '코리안 숏헤어', '렉돌', '먼치킨', '샴', '러시안 블루', 
        '뱅갈', '페르시안', '노르웨이 숲', '스코티쉬 폴드', '메인쿤'
    ],
    'HAMSTER': [
        '햄스터'
    ],
    'RABBIT': [
        '토끼'
    ],
    'BIRD': [
        '새'
    ],
    'FISH': [
        '물고기'
    ],
    'REPTILE': [
        '파충류'
    ],
    'OTHER': [
        '기타'
    ]
};
//종에 대응하는 모든 품종

export const PET_TYPES = [
  { label: '강아지', value: 'DOG' },
  { label: '고양이', value: 'CAT' },
  { label: '햄스터', value: 'HAMSTER' },
  { label: '토끼', value: 'RABBIT' },
  { label: '새', value: 'BIRD' },
  { label: '물고기', value: 'FISH' },
  { label: '파충류', value: 'REPTILE' },
  { label: '기타', value: 'OTHER' },
  // 필요하다면 백엔드 로그에 있던 나머지들도 미리 추가해두세요.
  // { label: '햄스터', value: 'HAMSTER' },
  // { label: '새', value: 'BIRD' },
];
//펫 타입
export const GENDER_TYPES = [
  { label: '남', value: 'MALE' },
  { label: '여', value: 'FEMALE' },
  { label: '미확인', value: 'UNKNOWN' },
];

//펫 성별 타입
export const NEUTERED_TYPES = [
    { label: '했어요', value: true },
    { label: '안 했어요', value: false }
];
//펫 중성화 타입
export const ACTIVITY_LEVEL_TYPES = [
    { label: '실내', value: 1 },
    { label: '중간', value: 2 },
    { label: '야외', value: 3 },
];
//펫 활동성 수치 타입