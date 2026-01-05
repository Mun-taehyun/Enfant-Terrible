const ProductsDisplay = () => {
  const products = [
    { id: 1, name: '강아지 사료', price: 25000, visible: true },
    { id: 2, name: '고양이 장난감', price: 12000, visible: false },
    { id: 3, name: '산책용 리드줄', price: 18000, visible: true },
  ];

  return (
    <div>
      <h2>상품 진열 관리</h2>
      <p>현재 쇼핑몰에 노출되는 상품을 확인합니다.</p>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th>상품명</th>
            <th>가격</th>
            <th>노출 여부</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.price.toLocaleString()}원</td>
              <td>
                {product.visible ? '노출' : '비노출'}
              </td>
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

export default ProductsDisplay;