import React, { useMemo } from 'react'
import type { ReportType, SalesSummaryRow, SalesByCategoryRow, RefundsDetailRow, TopSpendingCustomerRow } from '../../types/report'

interface ReportsChartProps {
  reportType: ReportType
  data: SalesSummaryRow | SalesByCategoryRow[] | RefundsDetailRow[] | TopSpendingCustomerRow[] | null
}

const numberFmt = (n: number) => n.toLocaleString()
const moneyFmt = (n: number) => n.toLocaleString(undefined, { style: 'currency', currency: 'USD' })

const Bar: React.FC<{ label: string; value: number; max: number; color?: string; rightLabel?: string }> = ({ label, value, max, color = 'bg-blue-600', rightLabel }) => {
  const pct = max > 0 ? Math.max(2, (value / max) * 100) : 0
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span className="truncate pr-2" title={label}>{label}</span>
        <span>{rightLabel ?? moneyFmt(value)}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-md h-3 overflow-hidden">
        <div className={`${color} h-3`} style={{ width: pct + '%' }} />
      </div>
    </div>
  )
}

const ReportsChart: React.FC<ReportsChartProps> = ({ reportType, data }) => {
  if (!data || (Array.isArray(data) && data.length === 0)) return null
  const isArray = Array.isArray(data)

  if (reportType === 'SALES_SUMMARY') {
    if (isArray) return null
    const row = data as SalesSummaryRow
    const maxVal = Math.max(row.total_sales, row.net_sales, Math.abs(row.total_refunds))
    return (
      <div className="bg-white shadow-sm rounded-lg p-5">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div className="p-3 rounded-lg bg-blue-50">
            <div className="text-xs text-gray-600">Total Sales</div>
            <div className="text-lg font-semibold">{moneyFmt(row.total_sales)}</div>
          </div>
          <div className="p-3 rounded-lg bg-red-50">
            <div className="text-xs text-gray-600">Total Refunds</div>
            <div className="text-lg font-semibold">{moneyFmt(row.total_refunds)}</div>
          </div>
          <div className="p-3 rounded-lg bg-green-50">
            <div className="text-xs text-gray-600">Net Sales</div>
            <div className="text-lg font-semibold">{moneyFmt(row.net_sales)}</div>
          </div>
          <div className="p-3 rounded-lg bg-gray-50">
            <div className="text-xs text-gray-600">Total Orders</div>
            <div className="text-lg font-semibold">{numberFmt(row.total_orders)}</div>
          </div>
          <div className="p-3 rounded-lg bg-purple-50">
            <div className="text-xs text-gray-600">Avg Order Value</div>
            <div className="text-lg font-semibold">{moneyFmt(row.average_order_value)}</div>
          </div>
        </div>
        <div>
          <Bar label="Total Sales" value={row.total_sales} max={maxVal} color="bg-blue-600" />
          <Bar label="Total Refunds" value={row.total_refunds} max={maxVal} color="bg-red-500" />
          <Bar label="Net Sales" value={row.net_sales} max={maxVal} color="bg-green-600" />
        </div>
      </div>
    )
  }

  if (reportType === 'SALES_BY_CATEGORY') {
    if (!isArray) return null
    const rows = data as SalesByCategoryRow[]
    const maxVal = Math.max(...rows.map(r => r.total_sales || 0), 0)
    return (
      <div className="bg-white shadow-sm rounded-lg p-5">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Sales by Category</h3>
        {rows.map((r, i) => (
          <Bar key={i} label={r.product_category || 'Uncategorized'} value={r.total_sales} max={maxVal} />
        ))}
      </div>
    )
  }

  if (reportType === 'TOP_SPENDING_CUSTOMERS') {
    if (!isArray) return null
    const rows = data as TopSpendingCustomerRow[]
    const maxVal = Math.max(...rows.map(r => r.total_spent || 0), 0)
    return (
      <div className="bg-white shadow-sm rounded-lg p-5">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Top Customers</h3>
        {rows.map((r) => (
          <Bar key={r.customer_id} label={r.customer_name || '—'} value={r.total_spent} max={maxVal} />
        ))}
      </div>
    )
  }

  // REFUNDS_DETAIL (aggregate by day)
  if (!isArray) return null
  const rows = data as RefundsDetailRow[]
  const byDay = useMemo(() => {
    const m = new Map<string, number>()
    for (const r of rows) {
      const d = new Date(r.refund_date)
      const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
      m.set(key, (m.get(key) || 0) + (r.refund_amount || 0))
    }
    return Array.from(m.entries()).sort((a,b) => a[0] < b[0] ? -1 : 1)
  }, [rows])
  const maxVal = Math.max(...byDay.map(([,v]) => v), 0)
  return (
    <div className="bg-white shadow-sm rounded-lg p-5">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Refunds by Day</h3>
      {byDay.map(([day, value]) => (
        <Bar key={day} label={day} value={value} max={maxVal} />
      ))}
    </div>
  )
}

export default ReportsChart
