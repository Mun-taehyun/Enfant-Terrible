// src/querys/admin/adminPost.query.ts
import type { AdminPostId, AdminPostListRequest } from "@/types/admin/post";
import {
  getAdminPosts,
  getAdminPostDetail,
  createAdminPost,
  updateAdminPost,
  deleteAdminPost,
} from "@/apis/admin/request/adminPost.request";

// ✅ named export (hook에서 import { adminPostQuery } ... 에 대응)
export const adminPostQuery = {
  list: (params: AdminPostListRequest) => getAdminPosts(params),
  detail: (postId: AdminPostId) => getAdminPostDetail(postId),
  create: (body: FormData) => createAdminPost(body),
  update: (postId: AdminPostId, body: FormData) => updateAdminPost(postId, body),
  remove: (postId: AdminPostId) => deleteAdminPost(postId),
};

// ✅ default export도 제공 (혹시 다른 곳이 default import면 그대로 동작)
export default adminPostQuery;
