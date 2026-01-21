// src/types/admin/post.ts

export type AdminPostId = number;

export type AdminPostType = string; // enum 확정되면 union으로 잠그세요

export type AdminPostListRequest = {
  page?: number;     // default 1
  size?: number;     // default 20
  postType?: string; // nullable
  userId?: number;   // nullable
};

export type AdminPostListItem = {
  postId: AdminPostId;
  userId: number;
  postType: AdminPostType;
  title: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type AdminPostDetail = {
  postId: AdminPostId;
  userId: number;

  postType: AdminPostType;
  refType: string | null;
  refId: number | null;

  title: string;
  content: string;

  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
};

export type AdminPostSaveRequest = {
  postType: string;
  refType?: string | null;
  refId?: number | null;
  title: string;
  content: string;
};
