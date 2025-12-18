import React, { useState, useEffect } from 'react'
import { OrderService } from '../../services/orderService'
import { OrderDetail as OrderDetailType } from '../../types/order'
import { useAuth } from '../../contexts/AuthContext'
import {
  ArrowLeft, User, Phone, Mail, Calendar, Package, CreditCard,
  DollarSign, Edit3, AlertCircle, CheckCircle, Tag, Clock, Receipt
} from 'lucide-react'
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
  // ... (Logic remains identical)
  const { persona } = useAuth()
  const [order, setOrder] = useState<OrderDetailType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
    if (result.success && result.data) {
      setOrder(result.data)
    } else {
      setError(result.message)
    }
    setLoading(false)
  }

  useEffect(() => { loadOrderDetails() }, [orderId])

  const handleActionSuccess = (message: string) => {
    setSuccess(message)
    loadOrderDetails()
    setTimeout(() => setSuccess(''), 5000)
  }

  const handleUpdateGarmentStatus = (garmentId: string) => {
    setSelectedGarmentId(garmentId)
    setShowUpdateGarmentModal(true)
  }

  // Improved Modern Badge Styles
  const getBadgeStyles = (status: string) => {
    const base = "px-2.5 py-0.5 rounded-full text-xs font-semibold border "
    switch (status) {
      case 'COMPLETED': case 'PAID': case 'READY':
        return `${base} bg-emerald-50 text-emerald-700 border-emerald-200`
      case 'CANCELLED': case 'VOID': case 'REFUNDED':
        return `${base} bg-red-50 text-red-700 border-red-200`
      case 'READY_FOR_PICKUP': case 'IN_PRESSING':
        return `${base} bg-blue-50 text-blue-700 border-blue-200`
      case 'IN_PROGRESS': case 'IN_WASH': case 'PENDING':
        return `${base} bg-amber-50 text-amber-700 border-amber-200`
      default:
        return `${base} bg-slate-50 text-slate-700 border-slate-200`
    }
  }

  const personName = persona?.personName || persona?.loginName || 'Admin'

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-500 font-medium animate-pulse">Fetching order details...</p>
        </div>
    )
  }

  if (error || !order) {
    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center">
            <div className="inline-flex p-4 bg-red-50 rounded-full mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Something went wrong</h2>
            <p className="text-slate-500 mt-2 mb-6">{error || 'Order not found'}</p>
            <button onClick={onClose} className="inline-flex items-center text-blue-600 font-semibold hover:underline">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to orders
            </button>
          </div>
        </div>
    )
  }

  return (
      <div className="max-w-6xl mx-auto">
        {/* 1. STICKY HEADER */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 -mx-4 px-4 py-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">Order Details</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-mono font-medium text-slate-400">#{order.order_info.order_id.substring(0, 8)}</span>
                <span className={getBadgeStyles(order.order_info.order_status)}>
                {order.order_info.order_status.replace(/_/g, ' ')}
              </span>
              </div>
            </div>
          </div>
        </div>

        {success && (
            <div className="mb-6 animate-in slide-in-from-top-2 duration-300">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <p className="text-sm font-medium text-emerald-800">{success}</p>
              </div>
            </div>
        )}

        {/* 2. MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN: Order Items & Actions */}
          <div className="lg:col-span-2 space-y-6">

            {/* Action Hub */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" /> Quick Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setShowUpdateOrderModal(true)} className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-medium text-sm">
                  <Edit3 className="h-4 w-4" /> Update Status
                </button>

                {order.financial_info?.payment_status !== 'PAID' && (
                    <button onClick={() => setShowProcessPaymentModal(true)} className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-medium text-sm">
                      <DollarSign className="h-4 w-4" /> Collect Payment
                    </button>
                )}

                {order.financial_info?.payment_status === 'PAID' && (
                    <button onClick={() => setShowProcessRefundModal(true)} className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all font-medium text-sm">
                      <Receipt className="h-4 w-4" /> Refund
                    </button>
                )}

                {order.order_info.order_status !== 'CANCELLED' && (
                    <button onClick={() => setShowCancelOrderModal(true)} className="px-4 py-2.5 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all font-medium text-sm">
                      Cancel
                    </button>
                )}
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" /> Items Breakdown
                </h3>
                <span className="text-xs font-semibold px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-500">
                {order.line_items.length} Product(s)
              </span>
              </div>

              <div className="divide-y divide-slate-100">
                {order.line_items.map((item) => (
                    <div key={item.item_id} className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg">{item.product_name}</h4>
                          <p className="text-sm text-slate-500 font-medium">
                            Qty: {item.quantity} × <span className="text-slate-900">${item.price.toFixed(2)}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">
                            ${(item.quantity * item.price).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Garment Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        {item.garments?.map((garment) => (
                            <div key={garment.garment_id} className="group flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-blue-200 transition-all">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200">
                                  <Tag className="h-4 w-4 text-slate-400" />
                                </div>
                                <div>
                                  <p className="text-xs font-mono font-bold text-slate-600 uppercase">
                                    {garment.garment_tag_id || 'Untagged'}
                                  </p>
                                  <span className={getBadgeStyles(garment.garment_status || 'PENDING')}>
                              {(garment.garment_status || 'PENDING').toLowerCase().replace(/_/g, ' ')}
                            </span>
                                </div>
                              </div>
                              <button
                                  onClick={() => handleUpdateGarmentStatus(garment.garment_id)}
                                  className="p-2 opacity-0 group-hover:opacity-100 hover:bg-blue-100 rounded-lg text-blue-600 transition-all"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                            </div>
                        ))}
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar (Customer & Invoice) */}
          <div className="space-y-6">

            {/* Customer Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <User className="h-4 w-4" /> Customer
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-lg font-bold text-slate-900 leading-tight">{order.customer_info.customer_name}</p>
                  <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm">
                    <Calendar className="h-3.5 w-3.5" />
                    Ordered on {new Date(order.order_info.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <a href={`tel:${order.customer_info.customer_phone_number}`} className="flex items-center gap-3 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                    <div className="p-1.5 bg-slate-50 rounded-md"><Phone className="h-4 w-4" /></div>
                    {order.customer_info.customer_phone_number}
                  </a>
                  {order.customer_info.customer_email && (
                      <a href={`mailto:${order.customer_info.customer_email}`} className="flex items-center gap-3 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                        <div className="p-1.5 bg-slate-50 rounded-md"><Mail className="h-4 w-4" /></div>
                        <span className="truncate">{order.customer_info.customer_email}</span>
                      </a>
                  )}
                </div>
              </div>
            </div>

            {/* Financials Card */}
            {order.financial_info && (
                <div className="bg-slate-900 rounded-2xl shadow-xl p-6 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <CreditCard className="h-20 w-20" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Financial Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <p className="text-sm text-slate-400">Total Amount</p>
                      <p className="text-3xl font-bold">${order.financial_info.total_amount.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between items-center py-3 border-y border-white/10">
                      <span className="text-xs font-medium text-slate-400">Payment Status</span>
                      <span className={getBadgeStyles(order.financial_info.payment_status)}>
                    {order.financial_info.payment_status.replace(/_/g, ' ')}
                  </span>
                    </div>

                    {/* Micro Transactions List */}
                    {order.financial_info.transactions && order.financial_info.transactions.length > 0 && (
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                          {order.financial_info.transactions.map((t) => (
                              <div key={t.transaction_id} className="flex justify-between items-center text-xs bg-white/5 p-2 rounded-lg">
                                <span className="opacity-80">{t.transaction_payment_method}</span>
                                <span className="font-bold font-mono">${t.transaction_amount.toFixed(2)}</span>
                              </div>
                          ))}
                        </div>
                    )}
                  </div>
                </div>
            )}
          </div>
        </div>

        {/* MODALS - Logic remains exactly the same */}
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
            onClose={() => { setShowUpdateGarmentModal(false); setSelectedGarmentId(null); }}
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