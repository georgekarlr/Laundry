import { supabase } from '../lib/supabase'

export interface SalesData {
  day: string
  sales: number
}

export interface DashboardMetrics {
  orders_ready_for_pickup: number
  overdue_pickups: number
  todays_sales: number
  new_orders_today: number
  sales_last_7_days: SalesData[]
}

export interface DashboardMetricsResult {
  success: boolean
  data?: DashboardMetrics
  message: string
}

export class DashboardService {
  static async getDashboardMetrics(): Promise<DashboardMetricsResult> {
    try {
      const { data, error } = await supabase.rpc('get_dashboard_metrics')

      if (error) {
        console.error('Dashboard metrics error:', error)
        return {
          success: false,
          message: 'Failed to fetch dashboard metrics'
        }
      }

      // The function returns a table, so we get the first row
      const result = data?.[0]
      
      if (!result) {
        return {
          success: false,
          message: 'No dashboard data available'
        }
      }

      return {
        success: true,
        data: {
          orders_ready_for_pickup: result.orders_ready_for_pickup || 0,
          overdue_pickups: result.overdue_pickups || 0,
          todays_sales: parseFloat(result.todays_sales || '0'),
          new_orders_today: result.new_orders_today || 0,
          sales_last_7_days: result.sales_last_7_days || []
        },
        message: 'Dashboard metrics retrieved successfully'
      }
    } catch (error) {
      console.error('Dashboard metrics error:', error)
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }
}