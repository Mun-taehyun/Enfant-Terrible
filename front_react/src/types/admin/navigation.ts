// src/types/admin/navigation.ts

export type AdminNavItem = {
  label: string;
  to: string;
};

export type AdminNavSection = {
  title: string;
  items: AdminNavItem[];
};
