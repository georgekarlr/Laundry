import React, { useState, useEffect } from 'react'
import { OrderService } from '../../services/orderService'
import { OrderDetail as OrderDetailType } from '../../types/order'
import { useAuth } from '../../contexts/AuthContext'
import { ArrowLeft, User, Phone, Mail, Calendar, Package, CreditCard, DollarSign, CreditCard as Edit, X, AlertCircle, CheckCircle } from 'lucide-react'
import UpdateOrderStatusModal from './modals/UpdateOrderStatusModal'
import UpdateGarmentStatusModal from './modals/UpdateGarmentStatusModal'
import ProcessPaymentModal from './modals/ProcessPaymentModal'
import CancelOrderModal from './modals/CancelOrderModal'
import ProcessRefundModal from './modals/ProcessRefundModal'

interface OrderDetailProps {
  orderId: string
  onClose: () => void
}

const OrderDetail: React.FC<OrderDetailProps> = ({ orderId, onClose }) => {
  const { persona } = useAuth()
  const [order, setOrder] = useState<OrderDetailType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Modal states
  const [showUpdateOrderModal, setShowUpdateOrderModal] = useState(false)
  const [showUpdateGarmentModal, setShowUpdateGarmentModal] = useState(false)
  const [showProcessPaymentModal, setShowProcessPaymentModal] = useState(false)
  const [showCancelOrderModal, setShowCancelOrderModal] = useState(false)
  const [showProcessRefundModal, setShowProcessRefundModal] = useState(false)
  const [selectedGarmentId, setSelectedGarmentId] = useState<string | null>(null)

  const loadOrderDetails = async () => {
    setLoading(true)
    setError('')
    
    const result = await OrderService.getOrderDetails(orderId)
    console.log(result);
    if (result.success && result.data) {
      setOrder(result.data)
    } else {
      setError(result.message)
    }
    
    setLoading(false)
  }

  useEffect(() => {
    loadOrderDetails()
  }, [orderId])

  const handleActionSuccess = (message: string) => {
    setSuccess(message)
    loadOrderDetails() // Refresh order details
    setTimeout(() => setSuccess(''), 5000)
  }

  const handleUpdateGarmentStatus = (garmentId: string) => {
    setSelectedGarmentId(garmentId)
    setShowUpdateGarmentModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'PAID':
      case 'READY':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
      case 'VOID':
      case 'REFUNDED':
        return 'bg-red-100 text-red-800'
      case 'READY_FOR_PICKUP':
      case 'IN_PRESSING':
        return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS':
      case 'IN_WASH':
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PARTIALLY_PAID':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const personName = persona?.personName || persona?.loginName || 'Unknown'

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading order details...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600">{error || 'Order not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
            <p className="text-sm text-gray-600">Order ID: {order.order_info.order_id.substring(0, 8)}...</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.order_info.order_status)}`}>
            {order.order_info.order_status}
          </span>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
          <button onClick={() => setSuccess('')} className="ml-auto text-green-500 hover:text-green-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Customer Information */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <User className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Name</p>
            <p className="text-lg text-gray-900">{order.customer_info.customer_name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Phone</p>
            <p className="text-lg text-gray-900 flex items-center space-x-1">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{order.customer_info.customer_phone_number}</span>
            </p>
          </div>
          {order.customer_info.customer_email && (
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-lg text-gray-900 flex items-center space-x-1">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{order.customer_info.customer_email}</span>
              </p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-500">Order Date</p>
            <p className="text-lg text-gray-900 flex items-center space-x-1">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>{new Date(order.order_info.created_at).toLocaleDateString()}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Order Actions */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Order Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowUpdateOrderModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Update Status</span>
          </button>
          
          {order.financial_info && order.financial_info.payment_status !== 'PAID' && (
            <button
              onClick={() => setShowProcessPaymentModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CreditCard className="h-4 w-4" />
              <span>Process Payment</span>
            </button>
          )}
          
          {order.order_info.order_status !== 'CANCELLED' && (
            <button
              onClick={() => setShowCancelOrderModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Cancel Order</span>
            </button>
          )}
          
          {order.financial_info && order.financial_info.payment_status === 'PAID' && (
            <button
              onClick={() => setShowProcessRefundModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <DollarSign className="h-4 w-4" />
              <span>Process Refund</span>
            </button>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Package className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
        </div>
        <div className="space-y-6">
          {order.line_items.map((item) => (
            <div key={item.item_id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity} × ${item.price.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    ${(item.quantity * item.price).toFixed(2)}
                  </p>
                </div>
              </div>
              
              {/* Garments */}
              {item.garments && item.garments.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                    Garments ({item.garments.length})
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {item.garments.map((garment) => (
                      <div key={garment.garment_id} className="bg-gray-50 p-3 rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-sm text-gray-900">
                              {garment.garment_tag_id || 'No Tag'}
                            </p>
                            <p className="text-xs text-gray-600">
                              {garment.garment_description}
                            </p>
                            {garment.garment_notes && (
                              <p className="text-xs text-gray-500 italic mt-1">
                                {typeof garment.garment_notes === 'object' 
                                  ? JSON.stringify(garment.garment_notes)
                                  : garment.garment_notes
                                }
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(garment.garment_status || 'PENDING')}`}>
                              {(garment.garment_status || 'PENDING').replace(/_/g, ' ')}
                            </span>
                            <button
                              onClick={() => handleUpdateGarmentStatus(garment.garment_id)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Update Status"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Invoice Information */}
      {order.financial_info && (
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CreditCard className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-medium text-gray-900">Invoice Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Invoice ID</p>
              <p className="text-sm font-mono text-gray-900">
                {order.financial_info.invoice_id.substring(0, 8)}...
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Amount Due</p>
              <p className="text-lg font-medium text-gray-900">
                ${order.financial_info.total_amount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.financial_info.payment_status)}`}>
                {order.financial_info.payment_status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
          
          {/* Transactions */}
          {order.financial_info.transactions && order.financial_info.transactions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Transactions</h4>
              <div className="space-y-2">
                {order.financial_info.transactions.map((transaction) => (
                  <div key={transaction.transaction_id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.transaction_type} - {transaction.transaction_payment_method}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.created_at).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ${transaction.transaction_amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <UpdateOrderStatusModal
        isOpen={showUpdateOrderModal}
        onClose={() => setShowUpdateOrderModal(false)}
        onSuccess={handleActionSuccess}
        orderId={order.order_info.order_id}
        currentStatus={order.order_info.order_status}
        personName={personName}
      />

      <UpdateGarmentStatusModal
        isOpen={showUpdateGarmentModal}
        onClose={() => {
          setShowUpdateGarmentModal(false)
          setSelectedGarmentId(null)
        }}
        onSuccess={handleActionSuccess}
        garmentId={selectedGarmentId || ''}
        personName={personName}
      />

      <ProcessPaymentModal
        isOpen={showProcessPaymentModal}
        onClose={() => setShowProcessPaymentModal(false)}
        onSuccess={handleActionSuccess}
        orderId={order.order_info.order_id}
        amountDue={order.financial_info?.total_amount || 0}
        personName={personName}
      />

      <CancelOrderModal
        isOpen={showCancelOrderModal}
        onClose={() => setShowCancelOrderModal(false)}
        onSuccess={handleActionSuccess}
        orderId={order.order_info.order_id}
        personName={personName}
      />

      <ProcessRefundModal
        isOpen={showProcessRefundModal}
        onClose={() => setShowProcessRefundModal(false)}
        onSuccess={handleActionSuccess}
        invoiceId={order.financial_info?.invoice_id || ''}
        maxAmount={order.financial_info?.total_amount || 0}
        personName={personName}
      />
    </div>
  )
}

export default OrderDetail