import React, { useEffect, useState } from 'react'
import { Customer, OrderHistoryItem, CustomerService } from '../../services/customerService'
import { Phone, Mail, Calendar, X, Package, History, AlertCircle, Edit3, Hash } from 'lucide-react'
import LoadingSpinner from '../LoadingSpinner'

interface CustomerDetailProps {
  customer: Customer
  onClose: () => void
  onEdit?: (customer: Customer) => void
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customer, onClose, onEdit }) => {
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [errorHistory, setErrorHistory] = useState('')

  useEffect(() => {
    const fetchDetails = async () => {
      // Fetch Order History Only
      setLoadingHistory(true)
      setErrorHistory('')
      const historyResult = await CustomerService.getCustomerOrderHistory(customer.customer_id)
      if (historyResult.success && historyResult.data) {
        setOrderHistory(historyResult.data)
      } else {
        setErrorHistory(historyResult.message)
      }
      setLoadingHistory(false)
    }

    fetchDetails()
  }, [customer.customer_id])

  // Helper for initials
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
        />

        {/* Modal Container */}
        <div className="relative w-full max-w-3xl bg-slate-50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 fade-in duration-200">

          {/* Header / Actions */}
          <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">Customer Profile</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wide">
              {customer.customer_id.substring(0, 8)}
            </span>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                  <button
                      onClick={() => onEdit(customer)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit Profile
                  </button>
              )}
              <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Close details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto p-6 space-y-6">

            {/* 1. Hero Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Avatar */}
                <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600 border-4 border-slate-50 shadow-sm">
                  {getInitials(customer.customer_name)}
                </div>

                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">{customer.customer_name}</h1>
                    <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Member since {new Date(customer.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-700">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {customer.customer_phone_number}
                    </div>
                    {customer.customer_email && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-700">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          {customer.customer_email}
                        </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Order History Section (Full Width) */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <History className="h-4 w-4 text-orange-500" /> Recent Orders
              </h3>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[300px]">
                {loadingHistory ? (
                    <div className="flex items-center justify-center h-48"><LoadingSpinner /></div>
                ) : errorHistory ? (
                    <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
                      <AlertCircle className="h-5 w-5" /> {errorHistory}
                    </div>
                ) : orderHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <Package className="h-10 w-10 mb-2 opacity-20" />
                      <p>No orders on record</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Order ID</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Date</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Status</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                        {orderHistory.map((order) => (
                            <tr key={order.order_id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1.5 text-sm font-mono text-slate-700">
                                  <Hash className="h-3 w-3 text-slate-300" />
                                  {order.order_id.substring(0, 8)}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-500">
                                {new Date(order.created_at).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </td>
                              <td className="px-6 py-4 text-right">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${
                                order.order_status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    order.order_status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                                        'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {order.order_status.replace(/_/g, ' ')}
                            </span>
                              </td>
                            </tr>
                        ))}
                        </tbody>
                      </table>
                    </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
  )
}

export default CustomerDetail