import type { PopupItem } from './popup.types';

export const popupMock: PopupItem[] = [
  {
    id: 1,
    title: '신년 이벤트',
    period: '2025-01-01 ~ 2025-01-07',
    visible: true,
  },
  {
    id: 2,
    title: '배송비 무료 행사',
    period: '2025-01-10 ~ 2025-01-15',
    visible: false,
  },
];