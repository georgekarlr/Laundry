export interface TransactionListItem {
  transaction_id: string
  transaction_date: string
  customer_name: string
  order_id: string
  transaction_type: string
  transaction_payment_method: string
  transaction_amount: number
  person_name: string
}

export interface TransactionSearchParams {
  searchTerm?: string | null
  startDate?: string | null // ISO string
  endDate?: string | null // ISO string
  transactionType?: string | null
  paymentMethod?: string | null
  personName?: string | null
  limit?: number
  offset?: number
}