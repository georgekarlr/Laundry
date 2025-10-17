import React, { useState } from 'react'
import { OrderItem, CreateOrderResult } from '../../types/order'
import { ArrowLeft, CreditCard, DollarSign, Clock, Wallet, AlertCircle, CheckCircle, Receipt } from 'lucide-react'

interface TakePaymentStepProps {
  onPrevious: () => void
  onSubmitOrder: (paymentOption: 'PAY_LATER' | 'PAY_NOW' | 'USE_CREDIT', paymentMethod?: string | null, amountPaid?: number) => Promise<void>
  orderItems: OrderItem[]
  totalAmountDue: number
  isSubmittingOrder: boolean
  orderSubmissionError: string | null
  orderSubmissionSuccess: CreateOrderResult | null
  onResetForm: () => void
}

const TakePaymentStep: React.FC<TakePaymentStepProps> = ({
  onPrevious,
  onSubmitOrder,
  orderItems,
  totalAmountDue,
  isSubmittingOrder,
  orderSubmissionError,
  orderSubmissionSuccess,
  onResetForm
}) => {
  const [paymentOption, setPaymentOption] = useState<'PAY_LATER' | 'PAY_NOW' | 'USE_CREDIT'>('PAY_NOW')
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH')
  const [amountPaid, setAmountPaid] = useState<number>(totalAmountDue)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (paymentOption === 'PAY_NOW' && amountPaid < totalAmountDue) {
      return // Let the form validation handle this
    }

    await onSubmitOrder(
      paymentOption,
      paymentOption === 'PAY_LATER' ? null : paymentMethod,
      paymentOption === 'PAY_LATER' ? 0 : amountPaid
    )
  }

  const handleCreateAnotherOrder = () => {
    onResetForm()
  }

  // If order was successfully created, show success screen
  if (orderSubmissionSuccess) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Order Created Successfully!</h2>
          <p className="text-gray-600">Your order has been processed and saved to the system.</p>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Order ID</p>
              <p className="text-lg font-mono text-gray-900">{orderSubmissionSuccess.new_order_id.substring(0, 8)}...</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Invoice ID</p>
              <p className="text-lg font-mono text-gray-900">{orderSubmissionSuccess.new_invoice_id.substring(0, 8)}...</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-2">
            {orderItems.map((item) => (
              <div key={item.product_id} className="flex justify-between text-sm">
                <span>{item.product_name} × {item.quantity}</span>
                <span>${(item.price_at_sale * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-2 flex justify-between font-medium">
              <span>Total</span>
              <span>${totalAmountDue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={handleCreateAnotherOrder}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Another Order
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Receipt className="h-4 w-4" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Payment</h2>
        <p className="text-sm text-gray-600">Choose payment method and complete the order</p>
      </div>

      {orderSubmissionError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{orderSubmissionError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Summary */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Order Summary</h3>
          <div className="bg-white shadow-sm rounded-lg">
            <div className="divide-y divide-gray-200">
              {orderItems.map((item) => (
                <div key={item.product_id} className="p-4">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                      <p className="text-sm text-gray-500">
                        ${item.price_at_sale.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium text-gray-900">
                      ${(item.price_at_sale * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Total Amount:</span>
                <span className="text-xl font-bold text-blue-600">${totalAmountDue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Payment Options</h3>
          <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6 space-y-6">
            {/* Payment Option Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Payment Option</label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentOption"
                    value="PAY_NOW"
                    checked={paymentOption === 'PAY_NOW'}
                    onChange={(e) => setPaymentOption(e.target.value as 'PAY_NOW')}
                    className="text-blue-600"
                  />
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <div>
                    <span className="font-medium text-gray-900">Pay Now</span>
                    <p className="text-sm text-gray-500">Complete payment immediately</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentOption"
                    value="PAY_LATER"
                    checked={paymentOption === 'PAY_LATER'}
                    onChange={(e) => setPaymentOption(e.target.value as 'PAY_LATER')}
                    className="text-blue-600"
                  />
                  <Clock className="h-5 w-5 text-orange-600" />
                  <div>
                    <span className="font-medium text-gray-900">Pay Later</span>
                    <p className="text-sm text-gray-500">Customer will pay upon pickup</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentOption"
                    value="USE_CREDIT"
                    checked={paymentOption === 'USE_CREDIT'}
                    onChange={(e) => setPaymentOption(e.target.value as 'USE_CREDIT')}
                    className="text-blue-600"
                  />
                  <Wallet className="h-5 w-5 text-purple-600" />
                  <div>
                    <span className="font-medium text-gray-900">Use Store Credit</span>
                    <p className="text-sm text-gray-500">Pay using customer's store credit</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Payment Method (only for PAY_NOW and USE_CREDIT) */}
            {(paymentOption === 'PAY_NOW' || paymentOption === 'USE_CREDIT') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="CASH">Cash</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="STORE_CREDIT">Store Credit</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>
            )}

            {/* Amount Paid (only for PAY_NOW and USE_CREDIT) */}
            {(paymentOption === 'PAY_NOW' || paymentOption === 'USE_CREDIT') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount Paid</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={totalAmountDue}
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                {amountPaid < totalAmountDue && (
                  <p className="text-sm text-red-600 mt-1">
                    Amount paid must equal the total amount due (${totalAmountDue.toFixed(2)})
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={onPrevious}
                className="flex items-center space-x-2 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isSubmittingOrder}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous: Services</span>
              </button>
              <button
                type="submit"
                disabled={isSubmittingOrder || (paymentOption === 'PAY_NOW' && amountPaid < totalAmountDue)}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmittingOrder ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Order...</span>
                  </>
                ) : (
                  <>
                    <Receipt className="h-4 w-4" />
                    <span>Create Order</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default TakePaymentStep