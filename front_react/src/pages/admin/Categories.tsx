import { useEffect, useState, Fragment } from 'react';
import axios from '../../apis/core/axiosInstance';
import type { CSSProperties } from 'react';

/* =====================
   타입
===================== */
type Category = {
  id: number;
  name: string;
  parentId: number | null;
  order: number;
};

type AddType = 'MAIN' | 'SUB';

const Categories = () => {
  /* =====================
     상태
  ===================== */
  const [categories, setCategories] = useState<Category[]>([]);
  const [origin, setOrigin] = useState<Category[]>([]);

  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [newName, setNewName] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  /* =====================
     최초 조회
  ===================== */
  useEffect(() => {
    axios.get<Category[]>('/api/v1/admin/categories').then(res => {
      setCategories(res.data);
      setOrigin(res.data);
    });
  }, []);

  /* =====================
     변경 감지
  ===================== */
  const isChanged =
    JSON.stringify(categories) !== JSON.stringify(origin);

  /* =====================
     정렬 유틸
  ===================== */
  const sortByOrder = (list: Category[]) =>
    [...list].sort((a, b) => a.order - b.order);

  const getNextOrder = (parentId: number | null) => {
    const siblings = categories.filter(c => c.parentId === parentId);
    return siblings.length === 0
      ? 1
      : Math.max(...siblings.map(c => c.order)) + 1;
  };

  /* =====================
     추가
  ===================== */
  const addCategory = async (type: AddType) => {
    if (!newName.trim()) {
      alert('카테고리명을 입력해주세요.');
      return;
    }

    if (type === 'SUB' && selectedParentId === null) {
      alert('분류를 선택해주세요.');
      return;
    }

    if (!confirm('추가하시겠습니까?')) return;

    const parentId = type === 'MAIN' ? null : selectedParentId;
    const order = getNextOrder(parentId);

    const res = await axios.post<{ id: number; name: string }>(
      '/api/v1/admin/categories',
      {
        name: newName,
        parentId,
        order,
      }
    );

    /* 🔥 응답 보정 (핵심) */
    const newCategory: Category = {
      id: res.data.id,
      name: res.data.name,
      parentId,
      order,
    };

    setCategories(prev => [...prev, newCategory]);
    setNewName('');
  };

  /* =====================
     수정 (인라인)
  ===================== */
  const saveEdit = async (id: number) => {
    if (!confirm('수정하시겠습니까?')) return;

    const res = await axios.put<{ id: number; name: string }>(
      `/api/v1/admin/categories/${id}`,
      { name: editingName }
    );

    setCategories(prev =>
      prev.map(c =>
        c.id === id ? { ...c, name: res.data.name } : c
      )
    );

    setEditingId(null);
  };

  /* =====================
     삭제
  ===================== */
  const removeCategory = async (id: number) => {
    if (!confirm('삭제하시겠습니까?')) return;

    await axios.delete(`/api/v1/admin/categories/${id}`);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  /* =====================
     저장 (정렬 포함)
  ===================== */
  const saveAll = async () => {
    if (!confirm('저장하시겠습니까?')) return;

    await axios.put('/api/v1/admin/categories/order', {
      categories: categories.map(c => ({
        id: c.id,
        order: c.order,
      })),
    });

    alert('저장되었습니다.');
    setOrigin(categories);
  };

  /* =====================
     렌더 데이터
  ===================== */
  const mainCategories = sortByOrder(
    categories.filter(c => c.parentId === null)
  );

  /* =====================
     UI
  ===================== */
  return (
    <div>
      <h2>카테고리 관리</h2>

      {/* 추가 영역 (UI 유지) */}
      <div style={addWrap}>
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="카테고리명 입력"
        />
        <button style={purpleBtn} onClick={() => addCategory('MAIN')}>
          대분류 추가
        </button>
        <button style={purpleBtn} onClick={() => addCategory('SUB')}>
          중분류 추가
        </button>
      </div>

      {/* 리스트 */}
      <div style={listWrapper}>
        <table style={tableStyle}>
          <tbody>
            {categories.length === 0 && (
              <tr>
                <td style={emptyStyle}>데이터를 입력해주세요.</td>
              </tr>
            )}

            {mainCategories.map(main => (
              <Fragment key={main.id}>
                {/* 대분류 */}
                <tr style={{ background: '#e5e7eb' }}>
                  <td style={cell}>
                    <div style={row}>
                      <strong
                        onClick={() => setSelectedParentId(main.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        {main.name}
                      </strong>
                      <div>
                        <button
                          style={editBtn}
                          onClick={() => {
                            setEditingId(main.id);
                            setEditingName(main.name);
                          }}
                        >
                          수정
                        </button>
                        <button
                          style={deleteBtn}
                          onClick={() => removeCategory(main.id)}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>

                {/* 중분류 */}
                {sortByOrder(
                  categories.filter(c => c.parentId === main.id)
                ).map(sub => (
                  <tr key={sub.id}>
                    <td style={cell}>
                      <div style={row}>
                        {editingId === sub.id ? (
                          <input
                            value={editingName}
                            onChange={e => setEditingName(e.target.value)}
                          />
                        ) : (
                          sub.name
                        )}
                        <div>
                          {editingId === sub.id ? (
                            <button onClick={() => saveEdit(sub.id)}>
                              확인
                            </button>
                          ) : (
                            <button
                              style={editBtn}
                              onClick={() => {
                                setEditingId(sub.id);
                                setEditingName(sub.name);
                              }}
                            >
                              수정
                            </button>
                          )}
                          <button
                            style={deleteBtn}
                            onClick={() => removeCategory(sub.id)}
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* 저장 */}
      <button
        disabled={!isChanged}
        style={saveBtn}
        onClick={saveAll}
      >
        저장
      </button>
    </div>
  );
};

/* =====================
   스타일 (UI 그대로)
===================== */
const addWrap: CSSProperties = { marginBottom: 16 };

const listWrapper: CSSProperties = {
  maxHeight: 260,
  overflowY: 'auto',
  border: '1px solid #e5e7eb',
};

const tableStyle: CSSProperties = {
  width: '100%',
};

const cell: CSSProperties = {
  padding: 12,
};

const row: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const emptyStyle: CSSProperties = {
  padding: 20,
  textAlign: 'center',
};

const purpleBtn: CSSProperties = {
  backgroundColor: '#a855f7',
  color: '#fff',
  marginRight: 6,
};

const saveBtn: CSSProperties = {
  marginTop: 16,
  backgroundColor: '#a855f7',
  color: '#fff',
};

const editBtn: CSSProperties = {
  backgroundColor: '#a855f7',
  color: '#fff',
  marginRight: 6,
};

const deleteBtn: CSSProperties = {
  backgroundColor: '#3b82f6',
  color: '#fff',
};

export default Categories;






