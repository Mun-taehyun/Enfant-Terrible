import type { OrderItem } from './orders.types.ts';
import { ordersMock } from './orders.mock.ts';
import { tableStyle } from '../products/styles';

const Orders = () => {
  const orders: OrderItem[] = ordersMock;

  return (
    <div>
      <h2>사용자 주문 목록</h2>
      <p>사용자의 주문 및 결제 내역을 조회합니다.</p>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th>주문번호</th>
            <th>사용자</th>
            <th>상품</th>
            <th>금액</th>
            <th>상태</th>
            <th>주문일</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.userName}</td>
              <td>{order.product}</td>
              <td>{order.price.toLocaleString()}원</td>
              <td>{order.status}</td>
              <td>{order.orderDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Orders;