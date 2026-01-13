// src/views/admin/categories/CategoriesView.tsx
import { Fragment, useMemo } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import styles from '@/pages/admin/categories/CategoriesView.module.css';
import type { Category, CreateDraft, EditDraft } from '@/types/admin/Categories.types';

type Props = {
  categories: Category[];
  loading: boolean;
  serverMessage: string;

  // CREATE
  creating: CreateDraft;
  setCreating: Dispatch<SetStateAction<CreateDraft>>;
  creatingLoading: boolean;
  onCreate: () => void;

  // EDIT
  editing: EditDraft | null;
  setEditing: Dispatch<SetStateAction<EditDraft | null>>;
  saving: boolean;
  onStartEdit: (c: Category) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;

  // DELETE
  deletingId: number | null;
  onDelete: (id: number) => void;
};

const CategoriesView = ({
  categories,
  loading,
  serverMessage,

  creating,
  setCreating,
  creatingLoading,
  onCreate,

  editing,
  setEditing,
  saving,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,

  deletingId,
  onDelete,
}: Props) => {
  const mainCategories = useMemo(() => {
    return categories
      .filter((c: Category) => c.parentId === null)
      .slice()
      .sort((a: Category, b: Category) => a.order - b.order);
  }, [categories]);

  const subByParent = useMemo(() => {
    const map = new Map<number, Category[]>();

    categories
      .filter((c: Category) => c.parentId !== null)
      .forEach((c: Category) => {
        const pid = c.parentId as number;
        const arr = map.get(pid) ?? [];
        arr.push(c);
        map.set(pid, arr);
      });

    for (const [pid, arr] of map.entries()) {
      map.set(
        pid,
        arr.slice().sort((a: Category, b: Category) => a.order - b.order)
      );
    }

    return map;
  }, [categories]);

  if (loading) {
    return <p>카테고리를 불러오는 중입니다...</p>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>카테고리 관리</h2>
      <p className={styles.desc}>상품 카테고리를 관리합니다.</p>

      {serverMessage ? <div className={styles.messageBox}>{serverMessage}</div> : null}

      {/* CREATE */}
      <section className={styles.card}>
        <div className={styles.cardTitle}>카테고리 추가</div>

        <div className={styles.formGrid}>
          <div className={styles.field}>
            <div className={styles.label}>이름</div>
            <input
              className={styles.input}
              value={creating.name}
              onChange={e =>
                setCreating((prev: CreateDraft) => ({ ...prev, name: e.target.value }))
              }
              placeholder="예: 아우터 / 니트 / 스니커즈"
            />
          </div>

          <div className={styles.field}>
            <div className={styles.label}>구분</div>
            <select
              className={styles.input}
              value={creating.parentId === null ? '' : String(creating.parentId)}
              onChange={e => {
                const v = e.target.value;
                setCreating((prev: CreateDraft) => ({
                  ...prev,
                  parentId: v === '' ? null : Number(v),
                }));
              }}
            >
              <option value="">MAIN (상위)</option>
              {mainCategories.map((m: Category) => (
                <option key={m.id} value={m.id}>
                  SUB (상위: {m.name})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <div className={styles.label}>정렬 순서</div>
            <input
              className={styles.input}
              type="number"
              min={1}
              value={creating.order}
              onChange={e =>
                setCreating((prev: CreateDraft) => ({ ...prev, order: Number(e.target.value) }))
              }
            />
          </div>

          <div className={styles.actionsRight}>
            <button className={styles.primaryButton} onClick={onCreate} disabled={creatingLoading}>
              {creatingLoading ? '추가 중...' : '추가'}
            </button>
          </div>
        </div>

        <div className={styles.hint}>MAIN은 상위 카테고리, SUB는 선택한 MAIN 아래에 생성됩니다.</div>
      </section>

      {/* LIST */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>이름</th>
            <th className={styles.th}>구분</th>
            <th className={styles.th}>정렬</th>
            <th className={styles.th}>관리</th>
          </tr>
        </thead>

        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td className={styles.empty} colSpan={4}>
                등록된 카테고리가 없습니다.
              </td>
            </tr>
          ) : (
            mainCategories.map((main: Category) => {
              const subs = subByParent.get(main.id) ?? [];

              return (
                <Fragment key={main.id}>
                  {/* MAIN ROW */}
                  <tr>
                    <td className={styles.td}>
                      {editing?.id === main.id ? (
                        <input
                          className={styles.input}
                          value={editing.name}
                          onChange={e =>
                            setEditing((prev: EditDraft | null) =>
                              prev ? { ...prev, name: e.target.value } : prev
                            )
                          }
                        />
                      ) : (
                        <div className={styles.nameBlock}>
                          <div className={styles.nameMain}>{main.name}</div>
                          <div className={styles.meta}>ID: {main.id}</div>
                        </div>
                      )}
                    </td>

                    <td className={styles.td}>MAIN</td>

                    <td className={styles.td}>
                      {editing?.id === main.id ? (
                        <input
                          className={styles.input}
                          type="number"
                          min={1}
                          value={editing.order}
                          onChange={e =>
                            setEditing((prev: EditDraft | null) =>
                              prev ? { ...prev, order: Number(e.target.value) } : prev
                            )
                          }
                        />
                      ) : (
                        main.order
                      )}
                    </td>

                    <td className={styles.td}>
                      <div className={styles.rowActions}>
                        {editing?.id === main.id ? (
                          <>
                            <button
                              className={styles.primaryButton}
                              onClick={onSaveEdit}
                              disabled={saving}
                            >
                              {saving ? '저장 중...' : '저장'}
                            </button>
                            <button className={styles.button} onClick={onCancelEdit} disabled={saving}>
                              취소
                            </button>
                          </>
                        ) : (
                          <>
                            <button className={styles.button} onClick={() => onStartEdit(main)}>
                              수정
                            </button>
                            <button
                              className={styles.dangerButton}
                              onClick={() => onDelete(main.id)}
                              disabled={deletingId === main.id}
                            >
                              {deletingId === main.id ? '삭제 중...' : '삭제'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* SUB ROWS */}
                  {subs.map((sub: Category) => (
                    <tr key={sub.id}>
                      <td className={styles.td}>
                        {editing?.id === sub.id ? (
                          <div className={styles.editSubGrid}>
                            <input
                              className={styles.input}
                              value={editing.name}
                              onChange={e =>
                                setEditing((prev: EditDraft | null) =>
                                  prev ? { ...prev, name: e.target.value } : prev
                                )
                              }
                            />

                            <div className={styles.editSubRow}>
                              <div className={styles.field}>
                                <div className={styles.label}>상위(MAIN)</div>
                                <select
                                  className={styles.input}
                                  value={editing.parentId === null ? '' : String(editing.parentId)}
                                  onChange={e => {
                                    const v = e.target.value;
                                    setEditing((prev: EditDraft | null) =>
                                      prev
                                        ? { ...prev, parentId: v === '' ? null : Number(v) }
                                        : prev
                                    );
                                  }}
                                >
                                  <option value="">(MAIN으로 이동)</option>
                                  {mainCategories.map((m: Category) => (
                                    <option key={m.id} value={m.id}>
                                      {m.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className={styles.field}>
                                <div className={styles.label}>정렬</div>
                                <input
                                  className={styles.input}
                                  type="number"
                                  min={1}
                                  value={editing.order}
                                  onChange={e =>
                                    setEditing((prev: EditDraft | null) =>
                                      prev ? { ...prev, order: Number(e.target.value) } : prev
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className={styles.subNameBlock}>
                            <div className={styles.nameSub}>└ {sub.name}</div>
                            <div className={styles.meta}>ID: {sub.id}</div>
                          </div>
                        )}
                      </td>

                      <td className={styles.td}>SUB</td>

                      <td className={styles.td}>{editing?.id === sub.id ? '' : sub.order}</td>

                      <td className={styles.td}>
                        <div className={styles.rowActions}>
                          {editing?.id === sub.id ? (
                            <>
                              <button
                                className={styles.primaryButton}
                                onClick={onSaveEdit}
                                disabled={saving}
                              >
                                {saving ? '저장 중...' : '저장'}
                              </button>
                              <button className={styles.button} onClick={onCancelEdit} disabled={saving}>
                                취소
                              </button>
                            </>
                          ) : (
                            <>
                              <button className={styles.button} onClick={() => onStartEdit(sub)}>
                                수정
                              </button>
                              <button
                                className={styles.dangerButton}
                                onClick={() => onDelete(sub.id)}
                                disabled={deletingId === sub.id}
                              >
                                {deletingId === sub.id ? '삭제 중...' : '삭제'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CategoriesView;
