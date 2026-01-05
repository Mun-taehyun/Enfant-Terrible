const ProductsManage = () => {
  const products = [
    { id: 1, name: '강아지 사료', stock: 20 },
    { id: 2, name: '고양이 장난감', stock: 0 },
    { id: 3, name: '산책용 리드줄', stock: 7 },
  ];

  return (
    <div>
      <h2>상품 관리</h2>
      <p>상품을 등록, 수정, 삭제할 수 있습니다.</p>

      <div style={{ marginTop: '16px', marginBottom: '12px' }}>
        <button>+ 상품 등록</button>
      </div>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th>상품명</th>
            <th>재고</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.stock}</td>
              <td>
                <button style={{ marginRight: '8px' }}>수정</button>
                <button>삭제</button>
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
  marginTop: '12px',
  borderCollapse: 'collapse',
};

export default ProductsManage;