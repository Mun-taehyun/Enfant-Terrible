const Orders = () => {
  const orders = [
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

  return (
    <div>
      <h2>사용자 주문 목록</h2>
      <p>사용자의 주문 및 결제 내역을 조회합니다.</p>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th>주문번호</th>
            <th>사용자</th>
            <th>상품명</th>
            <th>금액</th>
            <th>주문상태</th>
            <th>주문일</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
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

const tableStyle: React.CSSProperties = {
  width: '100%',
  marginTop: '20px',
  borderCollapse: 'collapse',
};

export default Orders;