//src/types/admin/recommendation.ts

export type AdminRecoItem = {
  productId: number;
  score: number;
};

export type DjangoUserRecoResponse = {
  status: "success";
  user_id: number;
  results: AdminRecoItem[];
};

export type DjangoPopularRecoResponse = {
  status: "success";
  results: AdminRecoItem[];
};

export type DjangoRecoUpdateSuccess = {
  status: "success" | "warn";
  message: string;
  updated_at?: string;
};


export type DjangoErrorResponse = {
  status: "error";
  message: string;
};
