export interface Customer {
  id: number;
  username: string;
  customer_number: string;
  name: string;
  address: string;
  phone: string;
  service_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerResponse {
  success: boolean;
  message: string;
  data: {
    customers: Customer[];
    pagination: {
      page: number;
      quantity: number;
      total: number;
    };
  };
}
