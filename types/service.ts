export type Service = {
  id: number;
  name: string;
  min_usage: number;
  max_usage: number;
  price: number;
  createdAt?: string;
  updatedAt?: string;
};

// Response GET /services
export type ServiceListResponse = {
  success: boolean;
  message: string;
  data: Service[];
  count: number;
};

export type CreateServicePayload = {
  name: string;
  min_usage: number;
  max_usage: number;
  price: number;
};

export type UpdateServicePayload = {
  name?: string;
  min_usage?: number;
  max_usage?: number;
  price?: number;
};
