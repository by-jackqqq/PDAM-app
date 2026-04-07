// types/customer.ts

export interface CustomerUser {
  id: number;
  username: string;
  role: string;
}

export interface CustomerService {
  id: number;
  name: string;
  min_usage: number;
  max_usage: number;
  price: number;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  customer_number: string; // NIK
  service_id: number;
  user: CustomerUser;
  service: CustomerService | null;
}

export interface CustomerListResponse {
  data: Customer[];
  total: number;
  page: number;
  quantity: number;
}

export interface CreateCustomerPayload {
  username: string;
  password: string;
  name: string;
  phone: string;
  address: string;
  customer_number: string;
  service_id: number;
}

export interface UpdateCustomerPayload {
  name?: string;
  phone?: string;
  address?: string;
  password?: string;
}
