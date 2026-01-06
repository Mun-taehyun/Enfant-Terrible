// pages/admin/products/Manage.tsx
import { useState } from 'react';
import { ProductManageItem } from './types';
import { tableStyle } from './styles';

const ProductsManage = () => {
  const [products] = useState<ProductManageItem[]>([]);

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
          {products.length === 0 ? (
            <tr>
              <td colSpan={3} style={{ textAlign: 'center', padding: '16px' }}>
                등록된 상품이 없습니다.
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.stock}</td>
                <td>
                  <button style={{ marginRight: '8px' }}>수정</button>
                  <button>삭제</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsManage;