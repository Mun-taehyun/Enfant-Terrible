export const BREED_DATA: Record<string, string[]> = {
    '강아지': [
        '말티즈', '푸들', '포메라니안', '비숑 프리제', '시바견', 
        '골든 리트리버', '진돗개', '치와와', '닥스훈트', '요크셔 테리어', '프렌치 불독'
    ],
    '고양이': [
        '코리안 숏헤어', '렉돌', '먼치킨', '샴', '러시안 블루', 
        '뱅갈', '페르시안', '노르웨이 숲', '스코티쉬 폴드', '메인쿤'
    ],
    '기타': [
        '햄스터', '토끼', '새', '물고기', '파충류', '기타'
    ]
};
//종에 대응하는 모든 품종

export const PET_TYPES = ['강아지', '고양이', '기타'];
//펫 타입
export const GENDER_TYPES = ['수컷', '암컷', '미확인'];
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