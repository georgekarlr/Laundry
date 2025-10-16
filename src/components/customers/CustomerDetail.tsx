```typescript
import React, { useEffect, useState } from 'react'
import { Customer, CreditLedgerEntry, OrderHistoryItem, CustomerService } from '../../services/customerService'
import { User, Phone, Mail, Calendar, X, DollarSign, Package, CreditCard, History, AlertCircle } from 'lucide-react'
import LoadingSpinner from '../LoadingSpinner'

interface CustomerDetailProps {
  customer: Customer
  onClose: () => void
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customer, onClose }) => {
  const [ledger, setLedger] = useState<CreditLedgerEntry[]>([])
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([])
  const [loadingLedger, setLoadingLedger] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [errorLedger, setErrorLedger] = useState('')
  const [errorHistory, setErrorHistory] = useState('')

  useEffect(() => {
    const fetchDetails = async () => {
      // Fetch Credit Ledger
      setLoadingLedger(true)
      setErrorLedger('')
      const ledgerResult = await CustomerService.getCustomerCreditLedger(customer.customer_id)
      if (ledgerResult.success && ledgerResult.data) {
        setLedger(ledgerResult.data)
      } else {
        setErrorLedger(ledgerResult.message)
      }
      setLoadingLedger(false)

      // Fetch Order History
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

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-3">
          <User className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Customer Details</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close details"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Customer Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Name</p>
          <p className="text-lg font-semibold text-gray-900">{customer.customer_name}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Phone</p>
          <p className="text-lg text-gray-900 flex items-center space-x-1">
            <Phone className="h-4 w-4 text-gray-400" />
            <span>{customer.customer_phone_number}</span>
          </p>
        </div>
        {customer.customer_email && (
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="text-lg text-gray-900 flex items-center space-x-1">
              <Mail className="h-4 w-4 text-gray-400" />
              <span>{customer.customer_email}</span>
            </p>
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-gray-500">Member Since</p>
          <p className="text-lg text-gray-900 flex items-center space-x-1">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{new Date(customer.created_at).toLocaleDateString()}</span>
          </p>
        </div>
      </div>

      {/* Credit Ledger */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-medium text-gray-900">Credit Ledger</h3>
        </div>
        {loadingLedger ? (
          <LoadingSpinner />
        ) : errorLedger ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{errorLedger}</p>
          </div>
        ) : ledger.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No credit ledger entries.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ledger.map((entry) => (
                  <tr key={entry.ledger_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.ledger_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      <span className={entry.ledger_type === 'DEPOSIT' || entry.ledger_type === 'LOYALTY_AWARD' ? 'text-green-600' : 'text-red-600'}>
                        {entry.ledger_type === 'DEPOSIT' || entry.ledger_type === 'LOYALTY_AWARD' ? '+' : '-'}
                        ${entry.ledger_amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.ledger_notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order History */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <History className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-medium text-gray-900">Order History</h3>
        </div>
        {loadingHistory ? (
          <LoadingSpinner />
        ) : errorHistory ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{errorHistory}</p>
          </div>
        ) : orderHistory.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No order history found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orderHistory.map((order) => (
                  <tr key={order.order_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {order.order_id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.order_status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        order.order_status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
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
  )
}

export default CustomerDetail
```