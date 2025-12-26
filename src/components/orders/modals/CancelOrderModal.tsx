import React, { useState } from 'react'
import { OrderService } from '../../../services/orderService'
import { X as XIcon, AlertCircle } from 'lucide-react'

interface CancelOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (message: string) => void
  orderId: string
  personName: string
}

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
                                                             isOpen,
                                                             onClose,
                                                             onSuccess,
                                                             orderId,
                                                             personName,
                                                           }) => {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!reason.trim()) {
      setError('Cancellation reason is required')
      setLoading(false)
      return
    }

    try {
      const result = await OrderService.cancelOrder(orderId, reason.trim(), personName)

      if (result.success) {
        onSuccess('Order cancelled successfully')
        onClose()
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError('Failed to cancel order')
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
              - White background, Shadow-2xl, Red Theme accents
          */}
            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-100">

              {/* Header Section */}
              <div className="flex items-center justify-between border-b border-gray-100 bg-red-50/50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 leading-6">Cancel Order</h3>
                    <p className="text-xs text-gray-500">Order ID: #{orderId.slice(0, 8)}...</p>
                  </div>
                </div>
                <button
                    onClick={onClose}
                    className="rounded-full p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <XIcon className="h-5 w-5" />
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

                {/* Warning Banner */}
                <div className="mb-6 rounded-lg bg-gray-50 p-4 border border-gray-100">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    <span className="font-semibold text-gray-900">Warning:</span> Are you sure you want to cancel this order? This action cannot be undone and will stop all processing immediately.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                      Cancellation Reason <span className="text-red-600">*</span>
                    </label>
                    <textarea
                        id="reason"
                        rows={3}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 py-3 px-4 text-gray-900 shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 sm:text-sm transition-shadow resize-none"
                        placeholder="Please explain why this order is being cancelled..."
                        required
                    />
                  </div>

                  {/* Footer Buttons */}
                  <div className="mt-8 flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                        disabled={loading}
                    >
                      Keep Order
                    </button>
                    <button
                        type="submit"
                        className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        disabled={loading}
                    >
                      {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Cancelling...</span>
                          </div>
                      ) : (
                          'Cancel Order'
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

export default CancelOrderModal