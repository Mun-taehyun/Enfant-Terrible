// src/hooks/admin/adminQna.hook.ts

import { useQuery } from "@tanstack/react-query";
import { adminQnaRoomsQuery, adminQnaMessagesQuery } from "@/querys/admin/adminQna.query";
import type { AdminQnaRoomsParams, AdminQnaMessagesParams } from "@/types/admin/qna";

export function useAdminQnaRooms(params: AdminQnaRoomsParams) {
  return useQuery(adminQnaRoomsQuery(params));
}

export function useAdminQnaMessages(params: AdminQnaMessagesParams) {
  return useQuery(adminQnaMessagesQuery(params));
}
