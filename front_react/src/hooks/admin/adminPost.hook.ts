// src/hooks/admin/adminPost.hook.ts
import { useCallback, useEffect, useState } from "react";
import { adminPostQuery } from "@/querys/admin/adminPost.query";

import type { ApiResponse, AdminPageResponse } from "@/types/admin/api";
import type {
  AdminPostId,
  AdminPostDetail,
  AdminPostListItem,
  AdminPostListRequest,
  AdminPostSaveRequest,
} from "@/types/admin/post";

/* =========================
 *  공용 type guard 유틸
 * ========================= */

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function isBoolean(v: unknown): v is boolean {
  return typeof v === "boolean";
}

function isArray(v: unknown): v is unknown[] {
  return Array.isArray(v);
}

function hasKey(obj: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function getProp(obj: Record<string, unknown>, key: string): unknown {
  return obj[key];
}

/* =========================
 *  ApiResponse guard
 * ========================= */

function isApiResponse<T>(v: unknown): v is ApiResponse<T> {
  if (!isRecord(v)) return false;

  // success
  if (!hasKey(v, "success")) return false;
  const success = getProp(v, "success");
  if (!isBoolean(success)) return false;

  // message
  if (!hasKey(v, "message")) return false;
  const message = getProp(v, "message");
  if (!isString(message)) return false;

  // data (키 존재만 검사)
  if (!("data" in v)) return false;

  return true;
}

/* =========================
 *  Page shape guards
 * ========================= */

type PageShape1<T> = {
  page: number;
  size: number;
  totalCount: number;
  list: T[];
};

type PageShape2<T> = {
  content: T[];
  totalElements: number;
  size: number;
  number?: number; // 0-based
};

type PageShape3<T> = {
  items: T[];
  total: number;
  page: number;
  size: number;
};

function isPageShape1<T>(v: unknown): v is PageShape1<T> {
  if (!isRecord(v)) return false;

  const page = getProp(v, "page");
  const size = getProp(v, "size");
  const totalCount = getProp(v, "totalCount");
  const list = getProp(v, "list");

  return isNumber(page) && isNumber(size) && isNumber(totalCount) && isArray(list);
}

function isPageShape2<T>(v: unknown): v is PageShape2<T> {
  if (!isRecord(v)) return false;

  const content = getProp(v, "content");
  const totalElements = getProp(v, "totalElements");
  const size = getProp(v, "size");
  const number = getProp(v, "number"); // optional

  const okCore = isArray(content) && isNumber(totalElements) && isNumber(size);
  if (!okCore) return false;

  // number는 없거나 숫자여야 함
  if (number === undefined) return true;
  return isNumber(number);
}

function isPageShape3<T>(v: unknown): v is PageShape3<T> {
  if (!isRecord(v)) return false;

  const items = getProp(v, "items");
  const total = getProp(v, "total");
  const page = getProp(v, "page");
  const size = getProp(v, "size");

  return isArray(items) && isNumber(total) && isNumber(page) && isNumber(size);
}

/**
 * 백엔드 AdminPageResponse 구조가 프로젝트 타입과 다를 수 있어,
 * "실제 존재하는 키"로만 인식합니다. (추정 없이)
 */
function normalizeAdminPageResponse<T>(raw: unknown): AdminPageResponse<T> {
  if (isPageShape1<T>(raw)) {
    return {
      page: raw.page,
      size: raw.size,
      totalCount: raw.totalCount,
      list: raw.list,
    };
  }

  if (isPageShape2<T>(raw)) {
    const page = isNumber(raw.number) ? raw.number + 1 : 1;
    return {
      page,
      size: raw.size,
      totalCount: raw.totalElements,
      list: raw.content,
    };
  }

  if (isPageShape3<T>(raw)) {
    return {
      page: raw.page,
      size: raw.size,
      totalCount: raw.total,
      list: raw.items,
    };
  }

  throw new Error("페이지 응답 구조를 인식할 수 없습니다.");
}

/* =========================
 *  404 notFound 판별 (no any)
 * ========================= */

function extractAxiosStatus(e: unknown): number | null {
  // axios 에러 형태: e.response.status
  if (!isRecord(e)) return null;

  const response = getProp(e, "response");
  if (!isRecord(response)) return null;

  const status = getProp(response, "status");
  return isNumber(status) ? status : null;
}

function isNotFoundError(e: unknown): boolean {
  const status = extractAxiosStatus(e);
  if (status === 404) return true;

  const msg = e instanceof Error ? e.message : String(e ?? "");
  return msg.includes("404") || msg.includes("Not Found") || msg.includes("찾을 수 없습니다");
}

/* =========================
 *  Hooks
 * ========================= */

export function useAdminPosts(initial?: AdminPostListRequest) {
  const [params, setParams] = useState<AdminPostListRequest>(() => initial ?? { page: 1, size: 20 });
  const [data, setData] = useState<AdminPageResponse<AdminPostListItem> | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchList = useCallback(async (p: AdminPostListRequest) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const raw = await adminPostQuery.list(p);

      if (!isApiResponse<unknown>(raw)) {
        throw new Error("응답 형식이 ApiResponse가 아닙니다.");
      }
      if (!raw.success) {
        throw new Error(raw.message || "요청에 실패했습니다.");
      }

      const normalized = normalizeAdminPageResponse<AdminPostListItem>(raw.data);
      setData(normalized);
    } catch (e) {
      setData(null);
      setErrorMsg(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchList(params);
  }, [params, fetchList]);

  const refetch = useCallback(() => fetchList(params), [fetchList, params]);

  const setPage = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  const setSize = useCallback((size: number) => {
    setParams((prev) => ({ ...prev, size, page: 1 }));
  }, []);

  return { params, setParams, data, loading, errorMsg, refetch, setPage, setSize };
}

export function useAdminPostDetail(postId: AdminPostId | null) {
  const [data, setData] = useState<AdminPostDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 404는 “에러”가 아니라 “없음” 상태로 분리
  const [notFound, setNotFound] = useState(false);

  const fetchDetail = useCallback(async (id: AdminPostId) => {
    setLoading(true);
    setErrorMsg(null);
    setNotFound(false);

    try {
      const raw = await adminPostQuery.detail(id);

      if (!isApiResponse<AdminPostDetail>(raw)) {
        throw new Error("응답 형식이 ApiResponse가 아닙니다.");
      }
      if (!raw.success) {
        throw new Error(raw.message || "요청에 실패했습니다.");
      }

      setData(raw.data);
      setNotFound(false);
    } catch (e) {
      if (isNotFoundError(e)) {
        setData(null);
        setNotFound(true);
        setErrorMsg(null);
      } else {
        setData(null);
        setNotFound(false);
        setErrorMsg(e instanceof Error ? e.message : "알 수 없는 오류");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (postId == null) {
      setData(null);
      setErrorMsg(null);
      setNotFound(false);
      return;
    }
    void fetchDetail(postId);
  }, [postId, fetchDetail]);

  const refetch = useCallback(() => {
    if (postId == null) return;
    void fetchDetail(postId);
  }, [postId, fetchDetail]);

  return { data, loading, errorMsg, notFound, refetch };
}

export function useAdminPostMutations(onChanged?: () => void) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const run = useCallback(
    async <T,>(fn: () => Promise<T>) => {
      setLoading(true);
      setErrorMsg(null);

      try {
        const raw = await fn();

        // ApiResponse로 내려오면서 success:false면 공통 처리
        if (isApiResponse<unknown>(raw) && raw.success === false) {
          throw new Error(raw.message || "요청에 실패했습니다.");
        }

        onChanged?.();
        return raw;
      } catch (e) {
        setErrorMsg(e instanceof Error ? e.message : "알 수 없는 오류");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [onChanged]
  );

  const create = useCallback((body: AdminPostSaveRequest) => run(() => adminPostQuery.create(body)), [run]);
  const update = useCallback((id: AdminPostId, body: AdminPostSaveRequest) => run(() => adminPostQuery.update(id, body)), [run]);
  const remove = useCallback((id: AdminPostId) => run(() => adminPostQuery.remove(id)), [run]);

  return { loading, errorMsg, create, update, remove };
}
