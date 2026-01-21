// src/apis/admin/request/adminQna.request.ts

import {mainAxios} from "@/apis/admin/main_axios";
import type {
  AdminQnaRoomsParams,
  AdminQnaMessagesParams,
  GetAdminQnaRoomsData,
  AdminQnaMessageItem,
} from "@/types/admin/qna";
import type {
  GetAdminQnaRoomsResponse,
  GetAdminQnaMessagesResponse,
} from "@/apis/admin/response/adminQna.response";

function unwrapOrThrow<T>(res: { success: boolean; data: T; message: string }): T {
  if (!res.success) throw new Error(res.message || "요청에 실패했습니다.");
  return res.data;
}

export async function getAdminQnaRooms(
  params: AdminQnaRoomsParams
): Promise<GetAdminQnaRoomsData> {
  const { data } = await mainAxios.get<GetAdminQnaRoomsResponse>("/api/admin/qna/rooms", { params });
  return unwrapOrThrow(data);
}

export async function getAdminQnaMessages(
  params: AdminQnaMessagesParams
): Promise<AdminQnaMessageItem[]> {
  const { data } = await mainAxios.get<GetAdminQnaMessagesResponse>("/api/admin/qna/messages", {
    params,
  });
  return unwrapOrThrow(data);
}
