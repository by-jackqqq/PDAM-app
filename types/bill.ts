// types/bill.ts

export interface BillCustomer {
  id: number
  name: string
  customer_number: string
}

export interface BillService {
  id: number
  name: string
  price: number
}

export interface BillPayment {
  id: number
  amount?: number
  status?: string          // "pending" | "verified"
  proof_file?: string     // filename returned by API
  file?: string
  bill_id?: number
  bill?: { id: number }
  createdAt?: string
  updatedAt?: string
}

export interface Bill {
  id: number
  customer_id: number
  service_id: number
  month: number
  year: number
  measurement_number: string
  usage_value: number
  total_price: number
  status?: string         // "unpaid" | "pending" | "verified"
  paid?: boolean
  payments?: {
    id: number
    verified: boolean
    payment_proof: string
    total_amount: number
    payment_date?: string
    createdAt?: string
  }
  customer: BillCustomer
  service: BillService
  createdAt?: string
  updatedAt?: string
}

export interface BillListResponse {
  data: Bill[]
  total: number
  page: number
  quantity: number
}

export interface CreateBillPayload {
  customer_id: number
  service_id: number
  month: number
  year: number
  measurement_number: string
  usage_value: number
}

export interface UpdateBillPayload {
  customer_id?: number
  service_id?: number
  month?: number
  year?: number
  measurement_number?: string
  usage_value?: number
}

export const MONTH_NAMES = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
]
