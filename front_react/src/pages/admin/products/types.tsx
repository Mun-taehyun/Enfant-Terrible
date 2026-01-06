// pages/admin/products/types.ts

export type ProductDisplayItem = {
  id: number;
  name: string;
  price: number;
  visible: boolean;
};

export type ProductManageItem = {
  id: number;
  name: string;
  stock: number;
};