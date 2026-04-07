// types/admin.ts

export interface AdminUser {
  id: number;
  username: string;
  role: string;
}

export interface Admin {
  id: number;
  name: string;
  phone: string;
  user: AdminUser;
}

export interface AdminListResponse {
  data: Admin[];
  total: number;
  page: number;
  quantity: number;
}

// Payload untuk create
export interface CreateAdminPayload {
  username: string;
  password: string;
  name: string;
  phone: string;
}

// Payload untuk update (semua opsional)
export interface UpdateAdminPayload {
  name?: string;
  phone?: string;
  password?: string;
}
