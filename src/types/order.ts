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
  price_at_sale: number
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
  setPaymentDetails: (payment: PaymentDetails) => void
  submitOrder: (paymentOption: 'PAY_LATER' | 'PAY_NOW' | 'USE_CREDIT', paymentMethod?: string | null, amountPaid?: number) => Promise<void>
  resetForm: () => void
  getTotalAmount: () => number
}