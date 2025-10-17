import React, { useState } from 'react'
import { OrderService } from '../../../services/orderService'
import { DollarSign, X, AlertCircle } from 'lucide-react'

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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-6 w-6 text-orange-600" />
              <h3 className="text-lg font-medium text-gray-900">Process Refund</h3>
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
                Maximum Refund: <span className="font-semibold text-orange-600">${maxAmount.toFixed(2)}</span>
              </label>
            </div>

            <div>
              <label htmlFor="amountToRefund" className="block text-sm font-medium text-gray-700 mb-2">
                Refund Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="refundMethod" className="block text-sm font-medium text-gray-700 mb-2">
                Refund Method
              </label>
              <select
                id="refundMethod"
                value={refundMethod}
                onChange={(e) => setRefundMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                {refundMethods.map((method) => (
                  <option key={method} value={method}>
                    {method.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Refund Reason *
              </label>
              <textarea
                id="reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Please provide a reason for this refund..."
                required
              />
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
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                ) : (
                  'Process Refund'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProcessRefundModal