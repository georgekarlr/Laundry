import React from 'react'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Package, AlertTriangle, DollarSign, PlusCircle, TrendingUp, Calendar } from 'lucide-react'
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
      name: 'Orders Ready for Pickup', 
      value: metrics.orders_ready_for_pickup.toString(), 
      icon: Package, 
      change: '', 
      color: 'blue' 
    },
    { 
      name: 'Overdue Pickups', 
      value: metrics.overdue_pickups.toString(), 
      icon: AlertTriangle, 
      change: '', 
      color: 'red' 
    },
    { 
      name: "Today's Sales", 
      value: `$${metrics.todays_sales.toFixed(2)}`, 
      icon: DollarSign, 
      change: '', 
      color: 'green' 
    },
    { 
      name: 'New Orders Today', 
      value: metrics.new_orders_today.toString(), 
      icon: PlusCircle, 
      change: '', 
      color: 'purple' 
    },
  ] : []

  if (loadingMetrics) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-white overflow-hidden shadow-sm rounded-lg">
        <div className="px-6 py-8 sm:px-8">
          <div className="flex items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.email?.split('@')[0]}
                {persona && (
                  <span className="text-lg font-normal text-gray-600 ml-2">
                    ({persona.type === 'admin' ? 'Administrator' : 'Staff Member'})
                  </span>
                )}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {persona?.type === 'admin' 
                  ? "Here's your administrative dashboard overview."
                  : "Here's your staff dashboard overview."
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {metricsError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{metricsError}</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="bg-white overflow-hidden shadow-sm rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                      stat.color === 'blue' ? 'bg-blue-100' :
                      stat.color === 'red' ? 'bg-red-100' :
                      stat.color === 'green' ? 'bg-green-100' :
                      stat.color === 'purple' ? 'bg-purple-100' :
                      'bg-blue-100'
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        stat.color === 'blue' ? 'text-blue-600' :
                        stat.color === 'red' ? 'text-red-600' :
                        stat.color === 'green' ? 'text-green-600' :
                        stat.color === 'purple' ? 'text-purple-600' :
                        'text-blue-600'
                      }`} />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                        {stat.change && (
                          <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                            stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stat.change}
                          </div>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Content Areas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sales Last 7 Days */}
        {metrics && metrics.sales_last_7_days && (
          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">Sales Last 7 Days</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {metrics.sales_last_7_days.map((dayData, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(dayData.day).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${
                      dayData.sales > 0 ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      ${dayData.sales.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <p className="text-sm text-gray-600">New orders processed successfully</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm text-gray-600">Customer pickup notifications sent</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                <p className="text-sm text-gray-600">Daily sales report generated</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                Create new order
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                Process pickup
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                View reports
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                Manage customers
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard