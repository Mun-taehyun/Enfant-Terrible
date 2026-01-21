// src/query/admin/adminQna.query.ts

import { queryOptions } from "@tanstack/react-query";
import { getAdminQnaRooms, getAdminQnaMessages } from "@/apis/admin/request/adminQna.request";
import type { AdminQnaRoomsParams, AdminQnaMessagesParams } from "@/types/admin/qna";

export const adminQnaKeys = {
  all: ["admin", "qna"] as const,
  rooms: (params: AdminQnaRoomsParams) => ["admin", "qna", "rooms", params] as const,
  messages: (params: AdminQnaMessagesParams) => ["admin", "qna", "messages", params] as const,
};

export function adminQnaRoomsQuery(params: AdminQnaRoomsParams) {
  return queryOptions({
    queryKey: adminQnaKeys.rooms(params),
    queryFn: () => getAdminQnaRooms(params),
    staleTime: 10_000,
  });
}

export function adminQnaMessagesQuery(params: AdminQnaMessagesParams) {
  return queryOptions({
    queryKey: adminQnaKeys.messages(params),
    queryFn: () => getAdminQnaMessages(params),
    staleTime: 3_000,
    enabled: Number.isFinite(params.roomId) && params.roomId > 0,
  });
}
