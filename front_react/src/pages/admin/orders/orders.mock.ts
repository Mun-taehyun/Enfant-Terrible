// pages/admin/orders/orders.mock.ts
import type { OrderItem } from './orders.types';

export const ordersMock: OrderItem[] = [
  {
    id: 101,
    userName: '최성민',
    product: '강아지 사료',
    price: 25000,
    status: '결제완료',
    orderDate: '2025-01-02',
  },
  {
    id: 102,
    userName: '박성일',
    product: '고양이 장난감',
    price: 12000,
    status: '배송중',
    orderDate: '2025-01-03',
  },
];