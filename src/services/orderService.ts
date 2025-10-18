import { supabase } from '../lib/supabase'
import { 
  CreateOrderPayload, 
  CreateOrderResult,
  OrderListItem,
  OrderDetail,
  UpdateOrderStatusResult,
  UpdateGarmentStatusResult,
  ProcessPaymentResult,
  CancelOrderResult,
  ProcessRefundResult
} from '../types/order'

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

  static async searchOrders(
    searchTerm: string = '',
    orderStatus: string = 'ALL',
    paymentStatus: string = 'ALL'
  ): Promise<ServiceResult<OrderListItem[]>> {
    try {
      const { data, error } = await supabase.rpc('search_orders', {
        p_search_term: searchTerm,
        p_order_status: orderStatus,
        p_payment_status: paymentStatus
      })

      if (error) {
        console.error('Search orders error:', error)
        return {
          success: false,
          message: 'Failed to search orders'
        }
      }

      return {
        success: true,
        data: data as OrderListItem[],
        message: 'Orders retrieved successfully'
      }
    } catch (error) {
      console.error('Search orders error:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  static async getOrderDetails(orderId: string): Promise<ServiceResult<OrderDetail>> {
    try {
      const { data, error } = await supabase.rpc('get_order_details', {
        p_order_id: orderId
      })

      if (error) {
        console.error('Get order details error:', error)
        return {
          success: false,
          message: 'Failed to get order details'
        }
      }

      // Extract the nested JSONB object from the response
      const orderDetails = data
      
      if (!orderDetails) {
        return {
          success: false,
          message: 'Order not found'
        }
      }

      return {
        success: true,
        data: orderDetails as OrderDetail,
        message: 'Order details retrieved successfully'
      }
    } catch (error) {
      console.error('Get order details error:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  static async updateOrderStatus(
    orderId: string,
    newStatus: string,
    personName: string
  ): Promise<ServiceResult<UpdateOrderStatusResult>> {
    try {
      const { data, error } = await supabase.rpc('update_order_status', {
        p_order_id: orderId,
        p_new_status: newStatus,
        p_person_name: personName
      })

      if (error) {
        console.error('Update order status error:', error)
        return {
          success: false,
          message: 'Failed to update order status'
        }
      }

      const result = data?.[0]
      if (!result) {
        return {
          success: false,
          message: 'No result returned'
        }
      }

      return {
        success: true,
        data: result as UpdateOrderStatusResult,
        message: 'Order status updated successfully'
      }
    } catch (error) {
      console.error('Update order status error:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  static async updateGarmentStatusById(
    garmentId: string,
    newStatus: string,
    personName: string
  ): Promise<ServiceResult<UpdateGarmentStatusResult>> {
    try {
      const { data, error } = await supabase.rpc('update_garment_status_by_id', {
        p_garment_id: garmentId,
        p_new_status: newStatus,
        p_person_name: personName
      })

      if (error) {
        console.error('Update garment status error:', error)
        return {
          success: false,
          message: 'Failed to update garment status'
        }
      }

      const result = data?.[0]
      if (!result) {
        return {
          success: false,
          message: 'No result returned'
        }
      }

      return {
        success: true,
        data: result as UpdateGarmentStatusResult,
        message: 'Garment status updated successfully'
      }
    } catch (error) {
      console.error('Update garment status error:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  static async processOrderPayment(
    orderId: string,
    amountPaid: number,
    paymentMethod: string,
    personName: string
  ): Promise<ServiceResult<ProcessPaymentResult>> {
    try {
      const { data, error } = await supabase.rpc('process_order_payment', {
        p_order_id: orderId,
        p_amount_paid: amountPaid,
        p_payment_method: paymentMethod,
        p_person_name: personName
      })

      if (error) {
        console.error('Process payment error:', error)
        return {
          success: false,
          message: 'Failed to process payment'
        }
      }

      const result = data?.[0]
      if (!result) {
        return {
          success: false,
          message: 'No result returned'
        }
      }

      return {
        success: true,
        data: result as ProcessPaymentResult,
        message: 'Payment processed successfully'
      }
    } catch (error) {
      console.error('Process payment error:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  static async cancelOrder(
    orderId: string,
    reason: string,
    personName: string
  ): Promise<ServiceResult<CancelOrderResult>> {
    try {
      const { data, error } = await supabase.rpc('cancel_order', {
        p_order_id: orderId,
        p_reason: reason,
        p_person_name: personName
      })

      if (error) {
        console.error('Cancel order error:', error)
        return {
          success: false,
          message: 'Failed to cancel order'
        }
      }

      const result = data?.[0]
      if (!result) {
        return {
          success: false,
          message: 'No result returned'
        }
      }

      return {
        success: true,
        data: result as CancelOrderResult,
        message: 'Order cancelled successfully'
      }
    } catch (error) {
      console.error('Cancel order error:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  static async processRefund(
    invoiceId: string,
    amountToRefund: number,
    refundMethod: string,
    reason: string,
    personName: string
  ): Promise<ServiceResult<ProcessRefundResult>> {
    try {
      const { data, error } = await supabase.rpc('process_refund', {
        p_invoice_id: invoiceId,
        p_amount_to_refund: amountToRefund,
        p_refund_method: refundMethod,
        p_reason: reason,
        p_person_name: personName
      })

      if (error) {
        console.error('Process refund error:', error)
        return {
          success: false,
          message: 'Failed to process refund'
        }
      }

      const result = data?.[0]
      if (!result) {
        return {
          success: false,
          message: 'No result returned'
        }
      }

      return {
        success: true,
        data: result as ProcessRefundResult,
        message: 'Refund processed successfully'
      }
    } catch (error) {
      console.error('Process refund error:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }
}