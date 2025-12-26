import React, { useState } from 'react'
import { OrderService } from '../../../services/orderService'
import { CreditCard, X, AlertCircle, DollarSign, ChevronDown } from 'lucide-react'

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
      <>
        {/* LAYER 1: The Backdrop
          - Fixed position, Lower Z-index (40)
          - Handles Blur and Color (Dimming)
      */}
        <div
            className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm transition-opacity"
            onClick={onClose}
            aria-hidden="true"
        />

        {/* LAYER 2: The Scrollable Container
          - Fixed position, Highest Z-index (50)
          - Handles centering the modal
      */}
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">

            {/* LAYER 3: The Modal Panel
              - Relative position (sits strictly ON TOP of backdrop)
              - White background, Shadow-2xl, Green Theme accents
          */}
            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-100">

              {/* Header Section */}
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 leading-6">Process Payment</h3>
                    <p className="text-xs text-gray-500">Order ID: #{orderId.slice(0, 8)}...</p>
                  </div>
                </div>
                <button
                    onClick={onClose}
                    className="rounded-full p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body Section */}
              <div className="px-6 py-6">
                {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-50 p-4 border border-red-100">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-red-700">{error}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Amount Due Card */}
                  <div className="flex items-center justify-between rounded-xl bg-green-50 p-4 border border-green-100">
                    <span className="text-sm font-medium text-green-800">Total Amount Due</span>
                    <span className="text-lg font-bold text-green-700">${amountDue.toFixed(2)}</span>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {/* Amount Paid Input */}
                    <div>
                      <label htmlFor="amountPaid" className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Amount
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
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
                            className="block w-full rounded-lg border border-gray-300 pl-10 py-3 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 sm:text-sm transition-shadow"
                            required
                        />
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method
                      </label>
                      <div className="relative">
                        <select
                            id="paymentMethod"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 sm:text-sm cursor-pointer transition-shadow"
                            required
                        >
                          {paymentMethods.map((method) => (
                              <option key={method} value={method}>
                                {method.replace(/_/g, ' ')}
                              </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Buttons */}
                  <div className="mt-8 flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                        disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        disabled={loading}
                    >
                      {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Processing...</span>
                          </div>
                      ) : (
                          'Confirm Payment'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </>
  )
}

export default ProcessPaymentModal