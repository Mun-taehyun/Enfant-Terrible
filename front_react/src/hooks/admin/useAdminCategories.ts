// src/hooks/admin/useAdminCategories.ts
import { useEffect, useState } from 'react';
import type { AxiosError } from 'axios';

import axiosInstance from '@/apis/core/api/axiosInstance';
import type { ApiResponse, Category, CreateDraft, EditDraft } from '@/types/admin/Categories.types';

const API = {
  list: '/admin/categories', // GET
  create: '/admin/categories', // POST
  update: (id: number) => `/admin/categories/${id}`, // PUT (또는 PATCH)
  remove: (id: number) => `/admin/categories/${id}`, // DELETE
};

type ErrorBody = { message?: string } | ApiResponse<unknown>;

export default function useAdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 백 response의 message를 그대로 표시
  const [serverMessage, setServerMessage] = useState<string>('');

  // CREATE
  const [creating, setCreating] = useState<CreateDraft>({
    name: '',
    parentId: null,
    order: 1,
  });
  const [creatingLoading, setCreatingLoading] = useState<boolean>(false);

  // UPDATE
  const [editing, setEditing] = useState<EditDraft | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // DELETE
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const showServerMessage = (msg: string) => setServerMessage(msg ?? '');

  const extractAxiosMessage = (err: unknown): string => {
    const e = err as AxiosError<ErrorBody>;
    const data = e.response?.data;

    if (data && typeof data === 'object' && 'message' in data) {
      const m = (data as { message?: unknown }).message;
      if (typeof m === 'string' && m.trim().length > 0) return m;
    }

    return e.message || '요청 처리 중 오류가 발생했습니다.';
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get<ApiResponse<Category[]>>(API.list);

      if (res.data?.success) setCategories(res.data.data ?? []);
      else setCategories([]);

      showServerMessage(res.data?.message ?? '');
    } catch (error) {
      showServerMessage(extractAxiosMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createCategory = async () => {
    const name = creating.name.trim();

    if (!name) {
      showServerMessage('카테고리 이름을 입력해주세요.');
      return;
    }
    if (!Number.isFinite(creating.order) || creating.order <= 0) {
      showServerMessage('정렬 순서는 1 이상의 숫자여야 합니다.');
      return;
    }

    try {
      setCreatingLoading(true);

      const payload: CreateDraft = {
        name,
        parentId: creating.parentId,
        order: creating.order,
      };

      const res = await axiosInstance.post<ApiResponse<Category>>(API.create, payload);
      showServerMessage(res.data?.message ?? '');

      if (res.data?.success) {
        await fetchCategories();
        setCreating({ name: '', parentId: null, order: 1 });
      }
    } catch (error) {
      showServerMessage(extractAxiosMessage(error));
    } finally {
      setCreatingLoading(false);
    }
  };

  const startEdit = (c: Category) => {
    setEditing({
      id: c.id,
      name: c.name,
      parentId: c.parentId,
      order: c.order,
    });
  };

  const cancelEdit = () => setEditing(null);

  const saveEdit = async () => {
    if (!editing) return;

    const name = editing.name.trim();
    if (!name) {
      showServerMessage('카테고리 이름을 입력해주세요.');
      return;
    }
    if (!Number.isFinite(editing.order) || editing.order <= 0) {
      showServerMessage('정렬 순서는 1 이상의 숫자여야 합니다.');
      return;
    }

    try {
      setSaving(true);

      const payload: Omit<EditDraft, 'id'> = {
        name,
        parentId: editing.parentId,
        order: editing.order,
      };

      const res = await axiosInstance.put<ApiResponse<Category>>(API.update(editing.id), payload);
      showServerMessage(res.data?.message ?? '');

      if (res.data?.success) {
        await fetchCategories();
        setEditing(null);
      }
    } catch (error) {
      showServerMessage(extractAxiosMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const removeCategory = async (id: number) => {
    const ok = window.confirm('정말 삭제하시겠습니까?');
    if (!ok) return;

    try {
      setDeletingId(id);

      const res = await axiosInstance.delete<ApiResponse<null>>(API.remove(id));
      showServerMessage(res.data?.message ?? '');

      if (res.data?.success) {
        await fetchCategories();
      }
    } catch (error) {
      showServerMessage(extractAxiosMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  return {
    categories,
    loading,
    serverMessage,

    creating,
    setCreating,
    creatingLoading,
    createCategory,

    editing,
    setEditing,
    saving,
    startEdit,
    cancelEdit,
    saveEdit,

    deletingId,
    removeCategory,

    fetchCategories,
  };
}
