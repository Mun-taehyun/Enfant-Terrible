import type {
  DjangoErrorResponse,
  DjangoPopularRecoResponse,
  DjangoRecoUpdateSuccess,
  DjangoUserRecoResponse,
  AdminRecoItem,
} from "@/types/admin/recommendation";

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function hasString(
  o: Record<string, unknown>,
  k: string
): o is Record<string, unknown> & Record<string, string> {
  return typeof o[k] === "string";
}

function normalizeItems(v: unknown): AdminRecoItem[] {
  if (!Array.isArray(v)) return [];
  const out: AdminRecoItem[] = [];
  for (const row of v) {
    if (!isObject(row)) continue;
    const productId = row["productId"];
    const score = row["score"];
    if (typeof productId === "number" && typeof score === "number") {
      out.push({ productId, score });
    }
  }
  return out;
}

export function parseUserRecoResponse(data: unknown): DjangoUserRecoResponse {
  if (!isObject(data) || !hasString(data, "status")) {
    throw new Error("추천 서버 응답 형식이 올바르지 않습니다.");
  }
  if (data.status === "error") throw new Error((data as DjangoErrorResponse).message);

  const status = data.status;
  const user_id = data["user_id"];
  const results = normalizeItems(data["results"]);

  if (status !== "success" || typeof user_id !== "number") {
    throw new Error("추천 서버 응답 형식이 올바르지 않습니다.");
  }

  return { status: "success", user_id, results };
}

export function parsePopularRecoResponse(data: unknown): DjangoPopularRecoResponse {
  if (!isObject(data) || !hasString(data, "status")) {
    throw new Error("추천 서버 응답 형식이 올바르지 않습니다.");
  }
  if (data.status === "error") throw new Error((data as DjangoErrorResponse).message);

  if (data.status !== "success") {
    throw new Error("추천 서버 응답 형식이 올바르지 않습니다.");
  }

  const results = normalizeItems(data["results"]);
  return { status: "success", results };
}

export function parseRecoUpdateResponse(data: unknown): DjangoRecoUpdateSuccess {
  if (!isObject(data) || !hasString(data, "status")) {
    throw new Error("추천 서버 응답 형식이 올바르지 않습니다.");
  }
  if (data.status === "error") throw new Error((data as DjangoErrorResponse).message);

  const status = data["status"];
  const message = data["message"];
  const updated_at = data["updated_at"];

  if ((status !== "success" && status !== "warn") || typeof message !== "string") {
    throw new Error("추천 서버 응답 형식이 올바르지 않습니다.");
  }

  return {
    status,
    message,
    updated_at: typeof updated_at === "string" ? updated_at : undefined,
  };
}
