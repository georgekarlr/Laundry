export type ReportType = 'SALES_SUMMARY' | 'SALES_BY_CATEGORY' | 'REFUNDS_DETAIL' | 'TOP_SPENDING_CUSTOMERS'

export interface ReportQueryParams {
  startDate: string // ISO string (TIMESTAMPTZ)
  endDate: string   // ISO string (TIMESTAMPTZ)
  limit?: number    // for top customers
}

// SQL RETURNS TABLE mappings
export interface SalesSummaryRow {
  total_sales: number
  total_refunds: number
  net_sales: number
  total_orders: number
  average_order_value: number
}

export interface SalesByCategoryRow {
  product_category: string | null
  total_sales: number
  order_count: number
}

export interface RefundsDetailRow {
  refund_date: string
  customer_name: string | null
  order_id: string
  refund_amount: number
  person_name: string | null
}

export interface TopSpendingCustomerRow {
  customer_id: string
  customer_name: string | null
  total_spent: number
  order_count: number
}
