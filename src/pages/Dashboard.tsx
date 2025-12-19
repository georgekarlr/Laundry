import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Package, AlertTriangle, DollarSign, PlusCircle, TrendingUp, Calendar, ArrowRight, Activity, Clock, ChevronRight } from 'lucide-react'
import { DashboardService, DashboardMetrics } from '../services/dashboardService'
import LoadingSpinner from '../components/LoadingSpinner'

const Dashboard: React.FC = () => {
  const { user, persona } = useAuth()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loadingMetrics, setLoadingMetrics] = useState(true)
  const [metricsError, setMetricsError] = useState('')

  useEffect(() => {
    const loadDashboardMetrics = async () => {
      setLoadingMetrics(true)
      setMetricsError('')

      try {
        const result = await DashboardService.getDashboardMetrics()

        if (result.success && result.data) {
          setMetrics(result.data)
        } else {
          setMetricsError(result.message)
        }
      } catch (error) {
        setMetricsError('Failed to load dashboard metrics')
      } finally {
        setLoadingMetrics(false)
      }
    }

    loadDashboardMetrics()
  }, [])

  const stats = metrics ? [
    {
      name: 'Orders Ready',
      value: metrics.orders_ready_for_pickup.toString(),
      icon: Package,
      change: 'Awaiting pickup',
      color: 'blue'
    },
    {
      name: 'Overdue',
      value: metrics.overdue_pickups.toString(),
      icon: AlertTriangle,
      change: 'Action required',
      color: 'red'
    },
    {
      name: "Today's Sales",
      value: `$${metrics.todays_sales.toFixed(2)}`,
      icon: DollarSign,
      change: 'Gross revenue',
      color: 'green'
    },
    {
      name: 'New Orders',
      value: metrics.new_orders_today.toString(),
      icon: PlusCircle,
      change: 'Received today',
      color: 'purple'
    },
  ] : []

  if (loadingMetrics) {
    return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-slate-500 font-medium animate-pulse">Initializing Dashboard...</p>
          </div>
        </div>
    )
  }

  // Helper for stat card styling
  const getCardStyles = (color: string) => {
    switch (color) {
      case 'blue': return { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-100', iconBg: 'bg-blue-100' }
      case 'red': return { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100', iconBg: 'bg-rose-100' }
      case 'green': return { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100', iconBg: 'bg-emerald-100' }
      case 'purple': return { bg: 'bg-purple-50', text: 'text-purple-600', ring: 'ring-purple-100', iconBg: 'bg-purple-100' }
      default: return { bg: 'bg-slate-50', text: 'text-slate-600', ring: 'ring-slate-100', iconBg: 'bg-slate-100' }
    }
  }

  return (
      <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">

        {/* 1. Hero Welcome Section */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-slate-800 opacity-50 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-indigo-600 opacity-20 blur-2xl"></div>

          <div className="relative px-8 py-10 sm:px-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                  Welcome back, {user?.email?.split('@')[0]}
                </h1>
                <p className="mt-2 text-slate-300 text-lg max-w-2xl">
                  {persona?.type === 'admin'
                      ? "Here's your administrative overview for today."
                      : "Here's your operational dashboard for today."
                  }
                </p>
              </div>
              {persona && (
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      persona.type === 'admin'
                          ? 'bg-indigo-500/20 border-indigo-400/30 text-indigo-200'
                          : 'bg-emerald-500/20 border-emerald-400/30 text-emerald-200'
                  }`}>
                {persona.type === 'admin' ? 'Administrator' : 'Staff Member'}
              </span>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {metricsError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center shadow-sm">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
              <p className="text-sm font-medium text-red-700">{metricsError}</p>
            </div>
        )}

        {/* 2. Key Metrics Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            const styles = getCardStyles(stat.color)

            return (
                <div key={stat.name} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 group">
                  <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-xl ${styles.iconBg} ${styles.text} group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    {stat.change && (
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md ${styles.bg} ${styles.text}`}>
                    {stat.change}
                  </span>
                    )}
                  </div>
                  <div className="mt-4">
                    <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{stat.value}</h3>
                    <p className="text-sm font-medium text-slate-500 mt-1">{stat.name}</p>
                  </div>
                </div>
            )
          })}
        </div>

        {/* 3. Dashboard Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN (Sales & Activity) - Spans 8 cols */}
          <div className="lg:col-span-8 space-y-8">

            {/* Sales History */}
            {metrics && metrics.sales_last_7_days && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-indigo-600" />
                      <h3 className="font-bold text-slate-900">Revenue Trends</h3>
                    </div>
                    <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">Last 7 Days</span>
                  </div>
                  <div className="p-2">
                    {metrics.sales_last_7_days.map((dayData, index) => (
                        <div key={index} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors group">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                              <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {new Date(dayData.day).toLocaleDateString('en-US', { weekday: 'long' })}
                              </p>
                              <p className="text-xs text-slate-500">
                                {new Date(dayData.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-bold font-mono ${dayData.sales > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                              ${dayData.sales.toFixed(2)}
                            </p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">Daily Sales</p>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
            )}

            {/* Recent Activity (Timeline Style) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                <Activity className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900">System Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {[
                    { text: 'New orders processed successfully', color: 'bg-emerald-500', time: '2 hours ago' },
                    { text: 'Customer pickup notifications sent', color: 'bg-blue-500', time: '4 hours ago' },
                    { text: 'Daily sales report generated', color: 'bg-amber-500', time: '5 hours ago' }
                  ].map((item, i) => (
                      <div key={i} className="relative flex gap-4">
                        <div className={`h-2.5 w-2.5 rounded-full ring-4 ring-white ${item.color} mt-1.5 z-10 flex-shrink-0`} />
                        <div>
                          <p className="text-sm font-medium text-slate-800">{item.text}</p>
                          <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" /> {item.time}
                      </span>
                        </div>
                      </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (Actions) - Spans 4 cols */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-6">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-900">Quick Actions</h3>
              </div>
              <div className="p-4 grid grid-cols-1 gap-3">
                {[
                  { label: 'Create Order', icon: PlusCircle, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'hover:border-indigo-200' },
                  { label: 'Process Pickup', icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'hover:border-emerald-200' },
                  { label: 'View Reports', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', border: 'hover:border-blue-200' },
                  { label: 'Customers', icon: ArrowRight, color: 'text-slate-600', bg: 'bg-slate-50', border: 'hover:border-slate-300' },
                ].map((action) => {
                  const Icon = action.icon
                  return (
                      <button key={action.label} className={`
                    flex items-center justify-between w-full p-4 rounded-xl border border-transparent 
                    bg-white hover:bg-slate-50 border-slate-100 ${action.border} 
                    transition-all duration-200 group shadow-sm hover:shadow
                  `}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-lg ${action.bg} ${action.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="font-semibold text-slate-700 group-hover:text-slate-900">{action.label}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500" />
                      </button>
                  )
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
  )
}

export default Dashboard