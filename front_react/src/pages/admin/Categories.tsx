import { useEffect, useState } from 'react';
import axios from '../../apis/core/axiosInstance';
import type { CSSProperties } from 'react';

type Category = {
  id: number;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
};

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 카테고리 목록 조회
  const fetchCategories = async () => {
    try {
      setLoading(true);

      const response = await axios.get<Category[]>(
        '/api/v1/admin/categories'
      );

      setCategories(response.data);
    } catch {
      alert('카테고리 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 카테고리 상태 변경
  const toggleCategoryStatus = async (id: number) => {
    try {
      await axios.put(`/api/v1/admin/categories/${id}/status`);
      fetchCategories(); // 🔁 변경 후 재조회
    } catch {
      alert('카테고리 상태 변경에 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return <p>카테고리 데이터를 불러오는 중...</p>;
  }

  return (
    <div>
      <h2>카테고리 관리</h2>
      <p>쇼핑몰에서 사용하는 상품 카테고리를 관리합니다.</p>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>카테고리명</th>
            <th style={thStyle}>상태</th>
            <th style={thStyle}>관리</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td style={tdStyle}>{category.id}</td>
              <td style={tdStyle}>{category.name}</td>
              <td style={tdStyle}>{category.status}</td>
              <td style={tdStyle}>
                <button
                  onClick={() => toggleCategoryStatus(category.id)}
                >
                  상태 변경
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const tableStyle: CSSProperties = {
  width: '100%',
  marginTop: '20px',
  borderCollapse: 'collapse',
};

const thStyle: CSSProperties = {
  borderBottom: '1px solid #ccc',
  padding: '8px',
  textAlign: 'left',
};

const tdStyle: CSSProperties = {
  padding: '8px',
};

export default Categories;