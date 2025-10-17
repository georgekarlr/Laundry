import React, { useState } from 'react'
import { OrderService } from '../../../services/orderService'
import { CreditCard, X, AlertCircle, DollarSign } from 'lucide-react'

interface ProcessPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (message: string) => void
  orderId: string
  amountDue: number
  personName: string
}

const paymentMethods = [
  'CASH',
  'CREDIT_CARD',
  'STORE_CREDIT',
  'BANK_TRANSFER'
]

const ProcessPaymentModal: React.FC<ProcessPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  orderId,
  amountDue,
  personName,
}) => {
  const [amountPaid, setAmountPaid] = useState(amountDue)
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (amountPaid <= 0) {
      setError('Amount paid must be greater than 0')
      setLoading(false)
      return
    }

    try {
      const result = await OrderService.processOrderPayment(orderId, amountPaid, paymentMethod, personName)
      
      if (result.success) {
        onSuccess('Payment processed successfully')
        onClose()
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError('Failed to process payment')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-medium text-gray-900">Process Payment</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Due: <span className="font-semibold text-green-600">${amountDue.toFixed(2)}</span>
              </label>
            </div>

            <div>
              <label htmlFor="amountPaid" className="block text-sm font-medium text-gray-700 mb-2">
                Amount Paid
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="amountPaid"
                  step="0.01"
                  min="0"
                  max={amountDue}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                ) : (
                  'Process Payment'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProcessPaymentModal