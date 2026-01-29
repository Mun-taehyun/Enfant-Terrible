// src/apis/admin/request/adminPost.request.ts
import { mainAxios } from "@/apis/admin/main_axios";

import type { ApiResponse, AdminPageResponse } from "@/types/admin/api";
import type {
  AdminPostId,
  AdminPostDetail,
  AdminPostListItem,
  AdminPostListRequest,
} from "@/types/admin/post";

/**
 * 중요:
 * - hooks/admin/adminPost.hook.ts 에서 isApiResponse()로 검증합니다.
 * - 그러므로 여기서는 "unwrap" 하지 말고, 반드시 ApiResponse 원형(res.data)을 그대로 반환해야 합니다.
 * - 또한 AxiosResponse 자체를 반환하면 안 되고, res.data만 반환해야 합니다.
 */

export async function getAdminPosts(
  params: AdminPostListRequest
): Promise<ApiResponse<AdminPageResponse<AdminPostListItem>>> {
  const res = await mainAxios.get<ApiResponse<AdminPageResponse<AdminPostListItem>>>(
    "/admin/posts",
    { params }
  );
  return res.data;
}

export async function getAdminPostDetail(
  postId: AdminPostId
): Promise<ApiResponse<AdminPostDetail>> {
  const res = await mainAxios.get<ApiResponse<AdminPostDetail>>(`/admin/posts/${postId}`);
  return res.data;
}

export async function createAdminPost(
  body: FormData
): Promise<ApiResponse<number>> {
  const res = await mainAxios.post<ApiResponse<number>>("/admin/posts", body);
  return res.data;
}

export async function updateAdminPost(
  postId: AdminPostId,
  body: FormData
): Promise<ApiResponse<null>> {
  // mock 스펙이 PUT 이므로 PUT 유지
  const res = await mainAxios.put<ApiResponse<null>>(`/admin/posts/${postId}`, body);
  return res.data;
}

export async function deleteAdminPost(
  postId: AdminPostId
): Promise<ApiResponse<null>> {
  const res = await mainAxios.delete<ApiResponse<null>>(`/admin/posts/${postId}`);
  return res.data;
}
