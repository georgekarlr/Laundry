import React from 'react'
import type { ReportType, SalesSummaryRow, SalesByCategoryRow, RefundsDetailRow, TopSpendingCustomerRow } from '../../types/report'
import { Receipt, User, TrendingUp, AlertCircle, Calendar, Hash, DollarSign, Layers, Trophy } from 'lucide-react'

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

  // 1. Modern Skeleton Loader
  if (loading) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-200">
              <div className="flex gap-4">
                <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between animate-pulse">
                  <div className="h-4 w-1/4 bg-slate-100 rounded" />
                  <div className="h-4 w-1/4 bg-slate-100 rounded" />
                  <div className="h-4 w-1/4 bg-slate-100 rounded" />
                </div>
            ))}
          </div>
        </div>
    )
  }

  // 2. Error State
  if (error) {
    return (
        <div className="bg-white rounded-2xl border border-red-100 p-12 text-center shadow-sm">
          <div className="mx-auto h-12 w-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Report Error</h3>
          <p className="text-red-600 mt-1 max-w-sm mx-auto">{error}</p>
        </div>
    )
  }

  const isArray = Array.isArray(data)
  const isEmptyArray = isArray && (data as any[]).length === 0

  // 3. Empty State
  const renderEmpty = () => (
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
        <div className="mx-auto h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <TrendingUp className="h-8 w-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">No data available</h3>
        <p className="text-slate-500 mt-1">Try adjusting your date range or filters.</p>
      </div>
  )

  if (!data || isEmptyArray) {
    return renderEmpty()
  }

  // --- SALES SUMMARY ---
  if (reportType === 'SALES_SUMMARY') {
    if (isArray) return renderEmpty()
    const row = data as SalesSummaryRow
    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sales</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Total Refunds</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Net Sales</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Total Orders</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Order Value</th>
              </tr>
              </thead>
              <tbody className="bg-white">
              <tr>
                <td className="px-6 py-6 whitespace-nowrap text-lg font-bold text-slate-900 font-mono">
                  {currency(row.total_sales)}
                </td>
                <td className="px-6 py-6 whitespace-nowrap text-lg font-bold text-red-600 font-mono">
                  {currency(row.total_refunds)}
                </td>
                <td className="px-6 py-6 whitespace-nowrap text-lg font-extrabold text-emerald-600 font-mono">
                  {currency(row.net_sales)}
                </td>
                <td className="px-6 py-6 whitespace-nowrap text-lg font-medium text-slate-700">
                  {row.total_orders.toLocaleString()}
                </td>
                <td className="px-6 py-6 whitespace-nowrap text-lg font-medium text-indigo-600 font-mono">
                  {currency(row.average_order_value)}
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
    )
  }

  // --- SALES BY CATEGORY ---
  if (reportType === 'SALES_BY_CATEGORY') {
    if (!isArray) return renderEmpty()
    const rows = data as SalesByCategoryRow[]
    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sales</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Orders Count</th>
              </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
              {rows.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-slate-400" />
                        <span className="font-medium text-slate-900">{r.product_category || 'Uncategorized'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-slate-700">
                      {currency(r.total_sales)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    <span className="bg-slate-100 px-2 py-1 rounded-md font-medium text-xs">
                      {r.order_count.toLocaleString()} Orders
                    </span>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
    )
  }

  // --- REFUNDS DETAIL ---
  if (reportType === 'REFUNDS_DETAIL') {
    if (!isArray) return renderEmpty()
    const rows = data as RefundsDetailRow[]
    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Refund Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Order Ref</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Staff</th>
              </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
              {rows.map((r) => (
                  <tr key={r.order_id + r.refund_date} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {new Date(r.refund_date).toLocaleDateString()}
                        <span className="text-xs opacity-50">{new Date(r.refund_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <User className="h-3 w-3" />
                        </div>
                        {r.customer_name || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-1.5 font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded w-fit border border-slate-100">
                        <Hash className="h-3 w-3" />
                        {r.order_id.substring(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600 font-mono">
                      {currency(r.refund_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {r.person_name || '—'}
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
    )
  }

  // --- TOP SPENDING CUSTOMERS ---
  if (!isArray) return renderEmpty()
  const rows = data as TopSpendingCustomerRow[]
  return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-16">Rank</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Total Spent</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Total Orders</th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
            {rows.map((r, idx) => (
                <tr key={r.customer_id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-400">
                    #{idx + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          idx === 0 ? 'bg-amber-100 text-amber-600' :
                              idx === 1 ? 'bg-slate-200 text-slate-600' :
                                  idx === 2 ? 'bg-orange-100 text-orange-700' :
                                      'bg-slate-100 text-slate-400'
                      }`}>
                        {idx < 3 ? <Trophy className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      </div>
                      <span className="font-bold text-slate-900">{r.customer_name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-emerald-600">
                    {currency(r.total_spent)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Receipt className="h-3.5 w-3.5 text-slate-400" />
                      {r.order_count.toLocaleString()}
                    </div>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
  )
}

export default ReportsTable