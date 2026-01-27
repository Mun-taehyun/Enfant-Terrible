// src/types/admin/login.ts

export type AdminLoginRequest = {
  email: string;
  password: string;
};

export type AdminLoginResponse = {
  accessToken: string;
  refreshToken: string;
};
