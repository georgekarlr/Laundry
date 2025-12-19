import React, { useMemo } from 'react'
import type { ReportType, SalesSummaryRow, SalesByCategoryRow, RefundsDetailRow, TopSpendingCustomerRow } from '../../types/report'
import { DollarSign, RefreshCcw, Wallet, ShoppingBag, TrendingUp, Layers, User, Calendar } from 'lucide-react'

interface ReportsChartProps {
  reportType: ReportType
  data: SalesSummaryRow | SalesByCategoryRow[] | RefundsDetailRow[] | TopSpendingCustomerRow[] | null
}

const numberFmt = (n: number) => n.toLocaleString()
const moneyFmt = (n: number) => n.toLocaleString(undefined, { style: 'currency', currency: 'USD' })

// Enhanced Bar Component with Animation and Icons
const Bar: React.FC<{
  label: string;
  value: number;
  max: number;
  color?: string;
  rightLabel?: string;
  icon?: React.ElementType;
}> = ({ label, value, max, color = 'bg-indigo-600', rightLabel, icon: Icon }) => {
  const pct = max > 0 ? Math.max(2, (value / max) * 100) : 0

  return (
      <div className="mb-4 last:mb-0 group">
        <div className="flex justify-between items-end mb-2 text-sm">
          <div className="flex items-center gap-2 font-medium text-slate-700">
            {Icon && <Icon className="h-4 w-4 text-slate-400" />}
            <span className="truncate max-w-[200px]" title={label}>{label}</span>
          </div>
          <span className="font-mono font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
          {rightLabel ?? moneyFmt(value)}
        </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
              className={`${color} h-full rounded-full transition-all duration-1000 ease-out shadow-sm`}
              style={{ width: pct + '%' }}
          />
        </div>
      </div>
  )
}

// KPI Card Component for Summary
const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType; colorClass: string }> = ({ title, value, icon: Icon, colorClass }) => (
    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-start justify-between hover:bg-white hover:shadow-md hover:border-slate-200 transition-all duration-300">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
      </div>
      <div className={`p-2.5 rounded-xl ${colorClass} bg-opacity-10`}>
        <Icon className={`h-5 w-5 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
    </div>
)

const ReportsChart: React.FC<ReportsChartProps> = ({ reportType, data }) => {
  if (!data || (Array.isArray(data) && data.length === 0)) return null
  const isArray = Array.isArray(data)

  // --- SALES SUMMARY VIEW ---
  if (reportType === 'SALES_SUMMARY') {
    if (isArray) return null
    const row = data as SalesSummaryRow
    const maxVal = Math.max(row.total_sales, row.net_sales, Math.abs(row.total_refunds))

    return (
        <div className="space-y-6">
          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard title="Total Sales" value={moneyFmt(row.total_sales)} icon={DollarSign} colorClass="bg-blue-500" />
            <StatCard title="Refunds" value={moneyFmt(row.total_refunds)} icon={RefreshCcw} colorClass="bg-rose-500" />
            <StatCard title="Net Sales" value={moneyFmt(row.net_sales)} icon={Wallet} colorClass="bg-emerald-500" />
            <StatCard title="Total Orders" value={numberFmt(row.total_orders)} icon={ShoppingBag} colorClass="bg-orange-500" />
            <StatCard title="Avg Order" value={moneyFmt(row.average_order_value)} icon={TrendingUp} colorClass="bg-purple-500" />
          </div>

          {/* Comparison Chart */}
          <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-slate-400" /> Revenue Breakdown
            </h4>
            <div className="space-y-1">
              <Bar label="Total Sales" value={row.total_sales} max={maxVal} color="bg-blue-500" />
              <Bar label="Total Refunds" value={Math.abs(row.total_refunds)} max={maxVal} color="bg-rose-500" />
              <Bar label="Net Sales" value={row.net_sales} max={maxVal} color="bg-emerald-500" />
            </div>
          </div>
        </div>
    )
  }

  // --- CATEGORY VIEW ---
  if (reportType === 'SALES_BY_CATEGORY') {
    if (!isArray) return null
    const rows = data as SalesByCategoryRow[]
    const maxVal = Math.max(...rows.map(r => r.total_sales || 0), 0)

    return (
        <div className="space-y-4">
          {rows.map((r, i) => (
              <Bar
                  key={i}
                  label={r.product_category || 'Uncategorized'}
                  value={r.total_sales}
                  max={maxVal}
                  icon={Layers}
                  color="bg-indigo-500"
              />
          ))}
        </div>
    )
  }

  // --- TOP CUSTOMERS VIEW ---
  if (reportType === 'TOP_SPENDING_CUSTOMERS') {
    if (!isArray) return null
    const rows = data as TopSpendingCustomerRow[]
    const maxVal = Math.max(...rows.map(r => r.total_spent || 0), 0)

    return (
        <div className="space-y-4">
          {rows.map((r, i) => (
              <Bar
                  key={r.customer_id}
                  label={r.customer_name || 'Unknown'}
                  value={r.total_spent}
                  max={maxVal}
                  icon={User}
                  color={i < 3 ? 'bg-amber-500' : 'bg-slate-400'} // Highlight top 3
              />
          ))}
        </div>
    )
  }

  // --- REFUNDS TIMELINE VIEW ---
  if (!isArray) return null
  const rows = data as RefundsDetailRow[]
  // Logic preserved strictly as requested
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
      <div className="space-y-4">
        {byDay.map(([day, value]) => (
            <Bar
                key={day}
                label={new Date(day).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                value={value}
                max={maxVal}
                icon={Calendar}
                color="bg-rose-500"
            />
        ))}
      </div>
  )
}

export default ReportsChart