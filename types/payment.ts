// types/payment.ts

import { Bill } from "./bill"

export interface Payment {
  id: number
  bill_id: number
  payment_proof: string
  total_amount: number
  verified: boolean
  createdAt?: string
  updatedAt?: string
  bill?: Bill
}

export interface PaymentListResponse {
  data: Payment[]
  total: number
  page: number
  quantity: number
}
