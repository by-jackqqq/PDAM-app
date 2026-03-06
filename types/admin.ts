export interface AdminUser {
  id: number;
  username: string;
  role: string;
}

export interface Admin {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  owner_token: string;
  createdAt: string;
  updatedAt: string;
  user: AdminUser;
}

export interface UpdateProfilePayload {
  name: string;
  phone: string;
  username: string;
  password?: string;
}

export interface CreateAdminPayload {
  name: string;
  username: string;
  password: string;
}
