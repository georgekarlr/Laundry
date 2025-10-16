import { supabase } from '../lib/supabase'
import { CreateOrderPayload, CreateOrderResult } from '../types/order'

export interface ServiceResult<T> {
  success: boolean
  data?: T
  message: string
}

export class OrderService {
  static async createOrder(payload: CreateOrderPayload): Promise<ServiceResult<CreateOrderResult>> {
    try {
      const { data, error } = await supabase.rpc('create_new_order', payload)

      if (error) {
        console.error('Order creation error:', error)
        return {
          success: false,
          message: 'Failed to create order'
        }
      }

      // The function returns a table, so we get the first row
      const result = data?.[0]
      
      if (!result) {
        return {
          success: false,
          message: 'No order data returned'
        }
      }

      return {
        success: true,
        data: {
          new_order_id: result.new_order_id,
          new_invoice_id: result.new_invoice_id
        },
        message: 'Order created successfully'
      }
    } catch (error) {
      console.error('Order creation error:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }
}