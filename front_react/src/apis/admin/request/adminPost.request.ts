// src/apis/admin/request/adminPost.request.ts
import { mainAxios } from "@/apis/admin/main_axios";
import type { AdminPostId, AdminPostListRequest, AdminPostSaveRequest } from "@/types/admin/post";

export async function getAdminPosts(params: AdminPostListRequest) {
  const res = await mainAxios.get("/api/admin/posts", { params });
  return res.data;
}

export async function getAdminPostDetail(postId: AdminPostId) {
  const res = await mainAxios.get(`/api/admin/posts/${postId}`);
  return res.data;
}

export async function createAdminPost(body: AdminPostSaveRequest) {
  const res = await mainAxios.post("/api/admin/posts", body);
  return res.data;
}

export async function updateAdminPost(postId: AdminPostId, body: AdminPostSaveRequest) {
  const res = await mainAxios.put(`/api/admin/posts/${postId}`, body);
  return res.data;
}

export async function deleteAdminPost(postId: AdminPostId) {
  const res = await mainAxios.delete(`/api/admin/posts/${postId}`);
  return res.data;
}
