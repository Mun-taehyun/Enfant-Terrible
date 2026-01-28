// src/apis/admin/response/adminPost.response.ts
import type { ApiResponse, AdminPageResponse } from "@/types/admin/api";
import type {
  AdminPostId,
  AdminPostListItem,
  AdminPostDetail,
} from "@/types/admin/post";

/** GET /api/admin/posts */
export type GetAdminPostsResponse =
  ApiResponse<AdminPageResponse<AdminPostListItem>>;

/** GET /api/admin/posts/{postId} */
export type GetAdminPostDetailResponse =
  ApiResponse<AdminPostDetail>;

/** POST /api/admin/posts -> postId */
export type CreateAdminPostResponse =
  ApiResponse<number | AdminPostId>;

/** PUT /api/admin/posts/{postId} */
export type UpdateAdminPostResponse =
  ApiResponse<null>;

/** DELETE /api/admin/posts/{postId} */
export type DeleteAdminPostResponse =
  ApiResponse<null>;
