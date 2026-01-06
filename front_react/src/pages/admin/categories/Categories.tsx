import { useEffect, useState, Fragment } from 'react';
import type { CSSProperties } from 'react';
import axiosInstance from '../../../apis/core/api/axiosInstance';

/* ======================
   타입
====================== */
type Category = {
  id: number;
  name: string;
  parentId: number | null;
  order: number;
};

/* ======================
   스타일
====================== */
const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '16px',
};

const Categories = () => {
  /* ======================
     상태
  ====================== */
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  /* ======================
     최초 조회
  ====================== */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get<Category[]>(
          '/v1/admin/categories'
        );
        setCategories(res.data);
      } catch (error) {
        console.error('카테고리 조회 실패', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <p>카테고리를 불러오는 중입니다...</p>;
  }

  return (
    <div>
      <h2>카테고리 관리</h2>
      <p>상품 카테고리를 관리합니다.</p>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th>이름</th>
            <th>구분</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td colSpan={3} style={{ textAlign: 'center', padding: '16px' }}>
                등록된 카테고리가 없습니다.
              </td>
            </tr>
          ) : (
            categories.map(category => (
              <Fragment key={category.id}>
                <tr>
                  <td>
                    {editingId === category.id ? (
                      <input
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                      />
                    ) : (
                      category.name
                    )}
                  </td>
                  <td>{category.parentId ? 'SUB' : 'MAIN'}</td>
                  <td>
                    {editingId === category.id ? (
                      <button onClick={() => setEditingId(null)}>저장</button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(category.id);
                          setEditingName(category.name);
                        }}
                      >
                        수정
                      </button>
                    )}
                  </td>
                </tr>
              </Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Categories;
