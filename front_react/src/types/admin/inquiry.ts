// src/types/admin/inquiry.ts
export type AdminProductInquiryStatus = string;
// 예: "WAITING" | "ANSWERED" 등 (백 enum 확정되면 union으로 잠그세요)

export type AdminProductInquiryListParams = {
  productId?: number | null;
  userId?: number | null;
  status?: string | null;
  page?: number; // default 1
  size?: number; // default 20
};

export type AdminProductInquiryListItem = {
  inquiryId: number;
  productId: number;
  userId: number;
  userEmail: string;

  content: string;
  isPrivate: boolean;
  status: AdminProductInquiryStatus;

  answerContent: string | null;
  answeredByUserId: number | null;
  answeredAt: string | null; // LocalDateTime -> ISO string으로 내려온다고 가정(백에서 직렬화)
  createdAt: string; // ISO string
};

export type AdminProductInquiryAnswerRequest = {
  answerContent: string; // @NotBlank
};
