export type Customer = {
  id: number;
  name: string;
  phone: string;
  address: string;
  customer_number: string;
  service_id: number;
  createdAt: string;
  updatedAt: string;
  user: {
    username: string;
    role: string;
  };
  service?: {
    id: number;
    name: string;
  };
};

// Response GET /customers
export type CustomerListResponse = {
  success: boolean;
  message: string;
  data: Customer[];
  count: number;
};

export type CreateCustomerPayload = {
  name: string;
  username: string;
  phone: string;
  password: string;
  customer_number: string;
  address: string;
  service_id: number;
};

export type UpdateCustomerPayload = {
  name?: string;
  username?: string;
  phone?: string;
  password?: string;
  customer_number?: string;
  address?: string;
  service_id?: number;
};

export type Service = {
  id: number;
  name: string;
  min_usage: number;
  max_usage: number;
  price: number;
};

export type ServiceListResponse = {
  success: boolean;
  message: string;
  data: Service[];
  count: number;
};
