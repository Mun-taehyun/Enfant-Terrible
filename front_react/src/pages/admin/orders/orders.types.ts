// pages/admin/orders/orders.types.ts
export interface OrderItem {
  id: number;
  userName: string;
  product: string;
  price: number;
  status: '결제완료' | '배송중' | '배송완료' | '취소';
  orderDate: string;
}
