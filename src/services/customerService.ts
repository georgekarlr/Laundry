import { supabase } from '../lib/supabase'

export interface Customer {
  customer_id: string
  user_id: string
  person_name: string | null
  customer_name: string
  customer_phone_number: string
  customer_email: string | null
  customer_preferences: any | null // jsonb type
  created_at: string
}

export interface CreditLedgerEntry {
  ledger_id: string
  user_id: string
  customer_id: string
  order_id: string | null
  ledger_type: 'DEPOSIT' | 'USAGE' | 'REFUND_TO_CREDIT' | 'LOYALTY_AWARD' | 'ADJUSTMENT'
  ledger_amount: number
  ledger_notes: string | null
  created_at: string
}

export interface OrderHistoryItem {
  order_id: string
  user_id: string
  customer_id: string
  order_status: 'AWAITING_PROCESSING' | 'IN_PROGRESS' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'CANCELLED'
  created_at: string
}

export interface ServiceResult<T> {
  success: boolean
  data?: T
  message: string
}

export class CustomerService {
  static async getAllCustomers(): Promise<ServiceResult<Customer[]>> {
    try {
      const { data, error } = await supabase
        .from('acd_customers')
        .select('*')
        .order('customer_name', { ascending: true })

      if (error) {
        console.error('Error fetching customers:', error)
        return { success: false, message: error.message }
      }

      return { success: true, data: data as Customer[], message: 'Customers fetched successfully' }
    } catch (error) {
      console.error('Network error fetching customers:', error)
      return { success: false, message: 'Network error occurred' }
    }
  }

  static async getCustomerCreditLedger(customerId: string): Promise<ServiceResult<CreditLedgerEntry[]>> {
    try {
      const { data, error } = await supabase
        .from('acd_customer_credit_ledger')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching customer credit ledger:', error)
        return { success: false, message: error.message }
      }

      return { success: true, data: data as CreditLedgerEntry[], message: 'Credit ledger fetched successfully' }
    } catch (error) {
      console.error('Network error fetching customer credit ledger:', error)
      return { success: false, message: 'Network error occurred' }
    }
  }

  static async getCustomerOrderHistory(customerId: string): Promise<ServiceResult<OrderHistoryItem[]>> {
    try {
      const { data, error } = await supabase
        .from('acd_orders')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching customer order history:', error)
        return { success: false, message: error.message }
      }

      return { success: true, data: data as OrderHistoryItem[], message: 'Order history fetched successfully' }
    } catch (error) {
      console.error('Network error fetching customer order history:', error)
      return { success: false, message: 'Network error occurred' }
    }
  }
}