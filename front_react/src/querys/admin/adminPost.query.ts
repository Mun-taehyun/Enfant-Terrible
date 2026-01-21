// src/query/admin/adminPost.query.ts
import type { AdminPostId, AdminPostListRequest, AdminPostSaveRequest } from "@/types/admin/post";
import {
  getAdminPosts,
  getAdminPostDetail,
  createAdminPost,
  updateAdminPost,
  deleteAdminPost,
} from "@/apis/admin/request/adminPost.request";

export const adminPostQuery = {
  list: (params: AdminPostListRequest) => getAdminPosts(params),
  detail: (postId: AdminPostId) => getAdminPostDetail(postId),
  create: (body: AdminPostSaveRequest) => createAdminPost(body),
  update: (postId: AdminPostId, body: AdminPostSaveRequest) => updateAdminPost(postId, body),
  remove: (postId: AdminPostId) => deleteAdminPost(postId),
};
