// pages/admin/products/Display.tsx
import { useState } from 'react';
import type { ProductDisplayItem } from './types';
import { tableStyle } from './styles';

const ProductsDisplay = () => {
  const [products] = useState<ProductDisplayItem[]>([]);

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
                <td>{product.price.toLocaleString()}원</td>
                <td>{product.visible ? '노출' : '비노출'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsDisplay;