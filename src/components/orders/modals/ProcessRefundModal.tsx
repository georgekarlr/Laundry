import React, { useState } from 'react'
import { OrderService } from '../../../services/orderService'
import { DollarSign, X, AlertCircle, ChevronDown } from 'lucide-react'

interface ProcessRefundModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (message: string) => void
  invoiceId: string
  maxAmount: number
  personName: string
}

const refundMethods = [
  'CASH',
  'CREDIT_CARD',
  'STORE_CREDIT'
]

const ProcessRefundModal: React.FC<ProcessRefundModalProps> = ({
                                                                 isOpen,
                                                                 onClose,
                                                                 onSuccess,
                                                                 invoiceId,
                                                                 maxAmount,
                                                                 personName,
                                                               }) => {
  const [amountToRefund, setAmountToRefund] = useState(maxAmount)
  const [refundMethod, setRefundMethod] = useState('CASH')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (amountToRefund <= 0) {
      setError('Refund amount must be greater than 0')
      setLoading(false)
      return
    }

    if (amountToRefund > maxAmount) {
      setError(`Refund amount cannot exceed $${maxAmount.toFixed(2)}`)
      setLoading(false)
      return
    }

    if (!reason.trim()) {
      setError('Refund reason is required')
      setLoading(false)
      return
    }

    try {
      const result = await OrderService.processRefund(
          invoiceId,
          amountToRefund,
          refundMethod,
          reason.trim(),
          personName
      )

      if (result.success) {
        onSuccess('Refund processed successfully')
        onClose()
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError('Failed to process refund')
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
              - White background, Shadow-2xl, Orange Theme accents
          */}
            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-100">

              {/* Header Section */}
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 leading-6">Process Refund</h3>
                    <p className="text-xs text-gray-500">Invoice ID: #{invoiceId.slice(0, 8)}...</p>
                  </div>
                </div>
                <button
                    onClick={onClose}
                    className="rounded-full p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
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

                  {/* Max Amount Info Card */}
                  <div className="flex items-center justify-between rounded-xl bg-orange-50 p-4 border border-orange-100">
                    <span className="text-sm font-medium text-orange-800">Available for Refund</span>
                    <span className="text-lg font-bold text-orange-700">${maxAmount.toFixed(2)}</span>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {/* Amount Input */}
                    <div>
                      <label htmlFor="amountToRefund" className="block text-sm font-medium text-gray-700 mb-2">
                        Refund Amount
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <DollarSign className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="number"
                            id="amountToRefund"
                            step="0.01"
                            min="0"
                            max={maxAmount}
                            value={amountToRefund}
                            onChange={(e) => setAmountToRefund(Number(e.target.value))}
                            className="block w-full rounded-lg border border-gray-300 pl-10 py-3 text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 sm:text-sm transition-shadow"
                            required
                        />
                      </div>
                    </div>

                    {/* Refund Method */}
                    <div>
                      <label htmlFor="refundMethod" className="block text-sm font-medium text-gray-700 mb-2">
                        Refund Method
                      </label>
                      <div className="relative">
                        <select
                            id="refundMethod"
                            value={refundMethod}
                            onChange={(e) => setRefundMethod(e.target.value)}
                            className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 sm:text-sm cursor-pointer transition-shadow"
                            required
                        >
                          {refundMethods.map((method) => (
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

                    {/* Reason Textarea */}
                    <div>
                      <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Refund <span className="text-orange-600">*</span>
                      </label>
                      <textarea
                          id="reason"
                          rows={3}
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          className="block w-full rounded-lg border border-gray-300 py-3 px-4 text-gray-900 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 sm:text-sm transition-shadow resize-none"
                          placeholder="e.g. Customer returned items, Quality issue..."
                          required
                      />
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
                        className="flex-1 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        disabled={loading}
                    >
                      {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Processing...</span>
                          </div>
                      ) : (
                          'Confirm Refund'
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

export default ProcessRefundModal