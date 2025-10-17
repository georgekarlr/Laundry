import React, { useState, useEffect, useMemo } from 'react'
import { OrderService } from '../services/orderService'
import { OrderListItem } from '../types/order'
import OrderList from '../components/orders/OrderList'
import OrderDetail from '../components/orders/OrderDetail'
import { Search, Filter, AlertCircle } from 'lucide-react'

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<OrderListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  const loadOrders = async () => {
    setLoading(true)
    setError('')
    
    const result = await OrderService.searchOrders(searchTerm, orderStatusFilter, paymentStatusFilter)
    
    if (result.success && result.data) {
      setOrders(result.data)
    } else {
      setError(result.message)
    }
    
    setLoading(false)
  }

  useEffect(() => {
    loadOrders()
  }, [searchTerm, orderStatusFilter, paymentStatusFilter])

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId)
  }

  const handleCloseDetail = () => {
    setSelectedOrderId(null)
    // Refresh orders list when closing detail view
    loadOrders()
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleOrderStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setOrderStatusFilter(event.target.value)
  }

  const handlePaymentStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPaymentStatusFilter(event.target.value)
  }

  if (selectedOrderId) {
    return (
      <OrderDetail 
        orderId={selectedOrderId} 
        onClose={handleCloseDetail}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="mt-1 text-sm text-gray-600">
          View and manage all customer orders.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white shadow-sm rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search orders by customer name..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          {/* Order Status Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={orderStatusFilter}
              onChange={handleOrderStatusChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="ALL">All Order Status</option>
              <option value="AWAITING_PROCESSING">Awaiting Processing</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="READY_FOR_PICKUP">Ready for Pickup</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={paymentStatusFilter}
              onChange={handlePaymentStatusChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="ALL">All Payment Status</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="VOID">Void</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <OrderList
        orders={orders}
        loading={loading}
        error={error}
        onSelectOrder={handleSelectOrder}
      />
    </div>
  )
}

export default Orders