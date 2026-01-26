export const isPlusByType = (type: string, amount: number) => {
  switch (type) {
    case 'EARN':
      return true;
    case 'USE':
    case 'EXPIRE':
      return false;
    case 'ADJUST':
      return amount > 0;
    default:
      return amount > 0;
  }
};

export const getPointTypeLabel = (type: string) => {
  switch (type) {
    case 'EARN':
      return '적립';
    case 'USE':
      return '사용';
    case 'EXPIRE':
      return '만료';
    case 'ADJUST':
      return '조정';
    default:
      return '';
  }
};

//라벨에 맞는 포인트 히스토리 노출 