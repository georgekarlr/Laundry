export interface GarmentData {
  tag_id: string
  description: string
  notes?: any // jsonb type
}

export interface CustomerData {
  customer_id?: string
  customer_name: string
  customer_phone_number: string
  customer_email?: string
}

export interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  price_at_sale: number // Price per unit at the time of sale
  garments?: GarmentData[] // Nested garments for this order item
  product_pricing_model: 'FIXED' | 'PER_KG' | 'PER_ITEM'
}

export interface PaymentDetails {
  payment_option: 'PAY_LATER' | 'PAY_NOW' | 'USE_CREDIT'
  payment_method?: string | null
  amount_paid: number
  transaction_id?: string
}

export interface OrderFormState {
  currentStep: number
  customer: CustomerData | null
  items: OrderItem[]
  payment: PaymentDetails | null
}

export interface CreateOrderPayload {
  p_customer_id: string
  p_order_items: {
    product_id: string
    quantity: number
    garments?: GarmentData[] // Nested garments for this order item
    price_at_sale: number
  }[]
  p_payment_option: 'PAY_LATER' | 'PAY_NOW' | 'USE_CREDIT'
  p_payment_method: string | null
  p_amount_paid: number
  p_person_name: string
}

export interface CreateOrderResult {
  new_order_id: string
  new_invoice_id: string
}

export interface UseOrderFormReturn {
  orderFormState: OrderFormState
  isSubmittingOrder: boolean
  orderSubmissionError: string | null
  orderSubmissionSuccess: CreateOrderResult | null
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  setCustomer: (customer: CustomerData) => void
  addOrderItem: (item: OrderItem) => void
  removeOrderItem: (productId: string) => void
  updateOrderItemQuantity: (productId: string, quantity: number) => void
  updateOrderItemGarments: (productId: string, garments: GarmentData[]) => void
  setPaymentDetails: (payment: PaymentDetails) => void
  submitOrder: (paymentOption: 'PAY_LATER' | 'PAY_NOW' | 'USE_CREDIT', paymentMethod?: string | null, amountPaid?: number) => Promise<void>
  resetForm: () => void
  getTotalAmount: () => number
}

// Orders Management Types
export interface OrderListItem {
  order_id: string
  customer_name: string
  order_created_at: string
  order_status: string
  payment_status: string
}

// New interfaces to match the JSONB structure from get_order_details
export interface GarmentDetail {
  garment_id: string
  garment_tag_id: string | null
  garment_description: string | null
  garment_notes: any | null
  garment_status: string | null
  created_at: string
}

export interface LineItem {
  item_id: string
  product_name: string
  quantity: number
  price: number
  garments: GarmentDetail[] | null
}

export interface OrderInfo {
  order_id: string
  created_at: string
  person_name: string
  order_status: string
}

export interface CustomerInfo {
  customer_id: string
  customer_name: string
  customer_phone_number: string
  customer_email?: string | null
}

export interface TransactionDetail {
  transaction_id: string
  transaction_amount: number
  transaction_type: string
  transaction_payment_method: string
  created_at: string
}

export interface FinancialInfo {
  invoice_id: string
  total_amount: number
  payment_status: string
  invoice_due_date?: string | null
  transactions?: TransactionDetail[]
}

export interface OrderDetail {
  line_items: LineItem[]
  order_info: OrderInfo
  customer_info: CustomerInfo
  financial_info: FinancialInfo
}

// Action Result Types
export interface UpdateOrderStatusResult {
  order_id: string
  updated_status: string
}

export interface UpdateGarmentStatusResult {
  garment_id: string
  updated_status: string
}

export interface ProcessPaymentResult {
  updated_invoice_id: string
  new_transaction_id: string
  new_invoice_status: string
}

export interface CancelOrderResult {
  cancelled_order_id: string
  final_order_status: string
  final_invoice_status: string
}

export interface ProcessRefundResult {
  updated_invoice_id: string
  new_invoice_status: string
}