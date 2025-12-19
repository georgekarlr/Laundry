import React, { useState, useEffect } from 'react'
import { OrderService } from '../services/orderService'
import { OrderListItem } from '../types/order'
import OrderList from '../components/orders/OrderList'
import OrderDetail from '../components/orders/OrderDetail'
import { Search, AlertCircle, X, RefreshCw, ListFilter } from 'lucide-react'

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<OrderListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  const isFiltered = searchTerm !== '' || orderStatusFilter !== 'ALL' || paymentStatusFilter !== 'ALL'

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
    const delayDebounceFn = setTimeout(() => {
      loadOrders()
    }, 300) // Debounce search to prevent excessive API calls
    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, orderStatusFilter, paymentStatusFilter])

  const resetFilters = () => {
    setSearchTerm('')
    setOrderStatusFilter('ALL')
    setPaymentStatusFilter('ALL')
  }

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">

        {/* 1. Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Orders</h1>
            <p className="mt-1 text-sm text-gray-500">
              {loading ? 'Updating...' : `Manage and track ${orders.length} orders`}
            </p>
          </div>
          <button
              onClick={loadOrders}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* 2. Error Message */}
        {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-red-700">{error}</div>
            </div>
        )}

        {/* 3. Adaptive Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-4 md:p-6 bg-gray-50/50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center text-sm font-semibold text-gray-700">
              <ListFilter className="h-4 w-4 mr-2 text-blue-600" />
              Filter & Search
            </div>
            {isFiltered && (
                <button
                    onClick={resetFilters}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 underline transition-colors"
                >
                  Clear all filters
                </button>
            )}
          </div>

          <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search Box */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                  type="text"
                  placeholder="Search by name or order #"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Selects */}
            <div className="flex gap-2">
              <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="ALL">All Orders</option>
                <option value="AWAITING_PROCESSING">Awaiting</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="READY_FOR_PICKUP">Ready</option>
                <option value="COMPLETED">Completed</option>
              </select>

              <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="ALL">All Payments</option>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Orders Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
          {loading && orders.length === 0 ? (
              /* Skeleton Loader */
              <div className="p-8 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 w-full bg-gray-100 animate-pulse rounded-md" />
                ))}
              </div>
          ) : orders.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
                <p className="text-sm text-gray-500 max-w-xs mt-1">Try adjusting your filters or search terms to find what you're looking for.</p>
              </div>
          ) : (
              <OrderList
                  orders={orders}
                  loading={loading}
                  onSelectOrder={setSelectedOrderId}
              />
          )}
        </div>

        {/* 5. Adaptive Modal (Slide-over on Mobile, Modal on Desktop) */}
        {selectedOrderId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              {/* Backdrop */}
              <div
                  className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                  onClick={() => setSelectedOrderId(null)}
              />

              {/* Modal Content */}
              <div className="relative bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-4xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-white sticky top-0 z-10">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Order Information</h2>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">ID: {selectedOrderId}</p>
                  </div>
                  <button
                      onClick={() => setSelectedOrderId(null)}
                      className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto bg-gray-50/30 p-4 sm:p-8">
                  <OrderDetail
                      orderId={selectedOrderId}
                      onClose={() => {
                        setSelectedOrderId(null);
                        loadOrders();
                      }}
                  />
                </div>
              </div>
            </div>
        )}
      </div>
  )
}

export default Orders