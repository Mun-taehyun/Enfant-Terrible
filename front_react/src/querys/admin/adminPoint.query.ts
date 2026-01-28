// src/query/admin/adminPoint.query.ts
import type { QueryKey } from "@tanstack/react-query";
import type { AdminPointHistoryParams } from "@/types/admin/point";

export const adminPointKeys = {
  all: ["admin", "points"] as const,
  balance: (userId: number) => [...adminPointKeys.all, "balance", userId] as const,
  history: (userId: number, params: AdminPointHistoryParams) =>
    [...adminPointKeys.all, "history", userId, params] as const,
};

export type AdminPointBalanceKey = ReturnType<typeof adminPointKeys.balance>;
export type AdminPointHistoryKey = ReturnType<typeof adminPointKeys.history>;
export type AdminPointAnyKey = QueryKey;
