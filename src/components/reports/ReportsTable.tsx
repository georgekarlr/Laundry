import React from 'react'
import type { ReportType, SalesSummaryRow, SalesByCategoryRow, RefundsDetailRow, TopSpendingCustomerRow } from '../../types/report'
import { Receipt, User, TrendingUp } from 'lucide-react'

interface ReportsTableProps {
  reportType: ReportType
  data: SalesSummaryRow | SalesByCategoryRow[] | RefundsDetailRow[] | TopSpendingCustomerRow[] | null
  loading: boolean
  error: string | null
}

const currency = (n: number) => {
  if (typeof n !== 'number' || Number.isNaN(n)) return '—'
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}

const ReportsTable: React.FC<ReportsTableProps> = ({ reportType, data, loading, error }) => {
  if (loading) {
    return (
      <div className="bg-white shadow-sm rounded-lg">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading report...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6 text-center">
        <Receipt className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  const isArray = Array.isArray(data)
  const isEmptyArray = isArray && (data as any[]).length === 0
  const renderEmpty = () => (
    <div className="bg-white shadow-sm rounded-lg p-6 text-center">
      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600">No data for selected filters.</p>
    </div>
  )

  if (!data || isEmptyArray) {
    return renderEmpty()
  }

  if (reportType === 'SALES_SUMMARY') {
    if (isArray) return renderEmpty()
    const row = data as SalesSummaryRow
    return (
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Refunds</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Sales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Order Value</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{currency(row.total_sales)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{currency(row.total_refunds)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{currency(row.net_sales)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{row.total_orders.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{currency(row.average_order_value)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (reportType === 'SALES_BY_CATEGORY') {
    if (!isArray) return renderEmpty()
    const rows = data as SalesByCategoryRow[]
    return (
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map((r, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{r.product_category || 'Uncategorized'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{currency(r.total_sales)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{r.order_count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (reportType === 'REFUNDS_DETAIL') {
    if (!isArray) return renderEmpty()
    const rows = data as RefundsDetailRow[]
    return (
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Refund Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map((r) => (
                <tr key={r.order_id + r.refund_date} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(r.refund_date).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm flex items-center">
                    <User className="h-4 w-4 mr-2 text-blue-600" />
                    {r.customer_name || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{r.order_id.substring(0, 8)}...</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{currency(r.refund_amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{r.person_name || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // TOP_SPENDING_CUSTOMERS
  if (!isArray) return renderEmpty()
  const rows = data as TopSpendingCustomerRow[]
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((r) => (
              <tr key={r.customer_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm">{r.customer_name || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{currency(r.total_spent)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{r.order_count.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ReportsTable
