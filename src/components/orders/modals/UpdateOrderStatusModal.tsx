import React, { useState } from 'react'
import { OrderService } from '../../../services/orderService'
import { CreditCard as Edit, X, AlertCircle, ChevronDown } from 'lucide-react'

interface UpdateOrderStatusModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (message: string) => void
  orderId: string
  currentStatus: string
  personName: string
}

const orderStatuses = [
  'AWAITING_PROCESSING',
  'IN_PROGRESS',
  'READY_FOR_PICKUP',
  'COMPLETED',
  'CANCELLED'
]

const UpdateOrderStatusModal: React.FC<UpdateOrderStatusModalProps> = ({
                                                                         isOpen,
                                                                         onClose,
                                                                         onSuccess,
                                                                         orderId,
                                                                         currentStatus,
                                                                         personName,
                                                                       }) => {
  const [newStatus, setNewStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await OrderService.updateOrderStatus(orderId, newStatus, personName)

      if (result.success) {
        onSuccess('Order status updated successfully')
        onClose()
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError('Failed to update order status')
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
              - White background, Shadow-2xl
          */}
            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-100">

              {/* Header Section */}
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Edit className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 leading-6">Update Status</h3>
                    <p className="text-xs text-gray-500">Order ID: #{orderId.slice(0, 8)}...</p>
                  </div>
                </div>
                <button
                    onClick={onClose}
                    className="rounded-full p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                  {/* Current Status Display */}
                  <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Current Status
                    </label>
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {currentStatus.replace(/_/g, ' ')}
                  </span>
                  </div>

                  {/* New Status Select */}
                  <div>
                    <label htmlFor="newStatus" className="block text-sm font-medium text-gray-700 mb-2">
                      Select New Status
                    </label>
                    <div className="relative">
                      <select
                          id="newStatus"
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:text-sm cursor-pointer transition-shadow"
                          required
                      >
                        {orderStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status.replace(/_/g, ' ')}
                            </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                        <ChevronDown className="h-4 w-4" />
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
                        className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        disabled={loading || newStatus === currentStatus}
                    >
                      {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Updating...</span>
                          </div>
                      ) : (
                          'Confirm Update'
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

export default UpdateOrderStatusModal