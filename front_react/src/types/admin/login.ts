// src/types/admin/login.ts

export type AdminLoginRequest = {
  adminId: string;
  password: string;
};

export type AdminLoginResponse = {
  adminId: string;
  accessToken: string;
};
