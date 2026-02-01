// src/types/admin/qna.ts

import type { ApiResponse, AdminPageResponse } from "@/types/admin/api";

export type AdminQnaRoomListItem = {
  roomId: number;
  userId: number;
  userEmail: string;
  status: string;
  lastMessageAt: string; // LocalDateTime -> JSON string
  unread: number;
};

export type AdminQnaMessageItem = {
  messageId: number;
  roomId: number;
  sender: string;
  message: string;
  createdAt: string; // LocalDateTime -> JSON string
};

export type GetAdminQnaRoomsData = AdminPageResponse<AdminQnaRoomListItem>;
export type GetAdminQnaRoomsResponse = ApiResponse<GetAdminQnaRoomsData>;

export type GetAdminQnaMessagesResponse = ApiResponse<AdminQnaMessageItem[]>;

export type AdminQnaRoomsParams = {
  page?: number;  // default 1
  size?: number;  // default 20
  userId?: number;
};

export type AdminQnaMessagesParams = {
  roomId: number;
  limit?: number; // default 50
};
