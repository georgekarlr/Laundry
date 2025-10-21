import { supabase } from '../lib/supabase'
import type { ServiceResult } from './orderService'
import type {
  SalesSummaryRow,
  SalesByCategoryRow,
  RefundsDetailRow,
  TopSpendingCustomerRow,
} from '../types/report'

export class ReportService {
  static async salesSummary(startDate: string, endDate: string): Promise<ServiceResult<SalesSummaryRow>> {
    try {
      const { data, error } = await supabase.rpc('report_sales_summary', {
        p_start_date: startDate,
        p_end_date: endDate,
      })

      if (error) {
        console.error('report_sales_summary error:', error)
        return { success: false, message: 'Failed to load sales summary' }
      }

      const row = Array.isArray(data) ? (data[0] as SalesSummaryRow | undefined) : undefined
      if (!row) {
        return { success: false, message: 'No sales summary data' }
      }

      return { success: true, data: row, message: 'Sales summary loaded successfully' }
    } catch (e) {
      console.error('report_sales_summary exception:', e)
      return { success: false, message: 'Network error occurred' }
    }
  }

  static async salesByCategory(startDate: string, endDate: string): Promise<ServiceResult<SalesByCategoryRow[]>> {
    try {
      const { data, error } = await supabase.rpc('report_sales_by_category', {
        p_start_date: startDate,
        p_end_date: endDate,
      })

      if (error) {
        console.error('report_sales_by_category error:', error)
        return { success: false, message: 'Failed to load sales by category' }
      }

      return { success: true, data: (data || []) as SalesByCategoryRow[], message: 'Sales by category loaded' }
    } catch (e) {
      console.error('report_sales_by_category exception:', e)
      return { success: false, message: 'Network error occurred' }
    }
  }

  static async refundsDetail(startDate: string, endDate: string): Promise<ServiceResult<RefundsDetailRow[]>> {
    try {
      const { data, error } = await supabase.rpc('report_refunds_detail', {
        p_start_date: startDate,
        p_end_date: endDate,
      })

      if (error) {
        console.error('report_refunds_detail error:', error)
        return { success: false, message: 'Failed to load refunds report' }
      }

      return { success: true, data: (data || []) as RefundsDetailRow[], message: 'Refunds report loaded' }
    } catch (e) {
      console.error('report_refunds_detail exception:', e)
      return { success: false, message: 'Network error occurred' }
    }
  }

  static async topSpendingCustomers(startDate: string, endDate: string, limit: number = 10): Promise<ServiceResult<TopSpendingCustomerRow[]>> {
    try {
      const { data, error } = await supabase.rpc('report_top_spending_customers', {
        p_start_date: startDate,
        p_end_date: endDate,
        p_limit: limit,
      })

      if (error) {
        console.error('report_top_spending_customers error:', error)
        return { success: false, message: 'Failed to load top customers' }
      }

      return { success: true, data: (data || []) as TopSpendingCustomerRow[], message: 'Top customers loaded' }
    } catch (e) {
      console.error('report_top_spending_customers exception:', e)
      return { success: false, message: 'Network error occurred' }
    }
  }
}
