import React from 'react'
import { OrderListItem } from '../../types/order'
import { User, ChevronRight, Hash, CreditCard } from 'lucide-react'

interface OrderListProps {
  orders: OrderListItem[]
  loading: boolean
  onSelectOrder: (orderId: string) => void
}

const OrderList: React.FC<OrderListProps> = ({ orders, loading, onSelectOrder }) => {

  // Refined Status Styling
  const getBadgeStyles = (status: string) => {
    const base = "px-2.5 py-0.5 rounded-full text-xs font-medium border "
    switch (status) {
      case 'COMPLETED':
      case 'PAID':
        return `${base} bg-emerald-50 text-emerald-700 border-emerald-200`
      case 'CANCELLED':
      case 'VOID':
      case 'REFUNDED':
        return `${base} bg-red-50 text-red-700 border-red-200`
      case 'READY_FOR_PICKUP':
        return `${base} bg-blue-50 text-blue-700 border-blue-200`
      case 'IN_PROGRESS':
      case 'PENDING':
      case 'PARTIALLY_PAID':
        return `${base} bg-amber-50 text-amber-700 border-amber-200`
      default:
        return `${base} bg-slate-50 text-slate-700 border-slate-200`
    }
  }

  // Formatting helper
  const formatStatus = (s: string) => s.replace(/_/g, ' ')

  if (loading && orders.length === 0) return null // Handled by parent skeleton

  return (
      <div className="w-full">
        {/* --- DESKTOP TABLE VIEW (Visible on md and up) --- */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
              <th className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
            {orders.map((order) => (
                <tr
                    key={order.order_id}
                    onClick={() => onSelectOrder(order.order_id)}
                    className="group hover:bg-blue-50/30 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Hash className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-sm font-mono font-medium text-gray-600">
                      {order.order_id.substring(0, 8)}
                    </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center mr-3 group-hover:bg-blue-100 transition-colors">
                        <User className="h-4 w-4 text-slate-500 group-hover:text-blue-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{order.customer_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.order_created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getBadgeStyles(order.order_status)}>
                    {formatStatus(order.order_status)}
                  </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getBadgeStyles(order.payment_status)}>
                    {formatStatus(order.payment_status)}
                  </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="p-2 bg-white rounded-full shadow-sm border border-gray-200">
                        <ChevronRight className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>

        {/* --- MOBILE CARD VIEW (Visible below md) --- */}
        <div className="md:hidden grid grid-cols-1 divide-y divide-gray-100">
          {orders.map((order) => (
              <button
                  key={order.order_id}
                  onClick={() => onSelectOrder(order.order_id)}
                  className="p-4 text-left active:bg-gray-50 flex items-center justify-between group"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-400">#{order.order_id.substring(0, 8)}</span>
                    <span className="text-xs text-gray-400">{new Date(order.order_created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center">
                    <p className="text-sm font-bold text-gray-900 truncate">{order.customer_name}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                <span className={getBadgeStyles(order.order_status)}>
                  {formatStatus(order.order_status)}
                </span>
                    <span className={getBadgeStyles(order.payment_status)}>
                  <span className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    {formatStatus(order.payment_status)}
                  </span>
                </span>
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-gray-300 ml-4 group-active:text-blue-500" />
              </button>
          ))}
        </div>
      </div>
  )
}

export default OrderList