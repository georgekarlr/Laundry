import React, { useState } from 'react'
import { OrderItem, CreateOrderResult } from '../../types/order'
import {
  ArrowLeft, CreditCard, DollarSign, Clock, Wallet,
  AlertCircle, CheckCircle, Receipt, Printer,
  Repeat, Tag, Banknote, Building
} from 'lucide-react'

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

  // --- SUCCESS VIEW ---
  if (orderSubmissionSuccess) {
    return (
        <div className="max-w-3xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
            <div className="bg-emerald-500 p-8 text-center text-white">
              <div className="mx-auto h-20 w-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 shadow-inner">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Order Successfully Created!</h2>
              <p className="text-emerald-100 text-lg">Transaction has been processed and saved.</p>
            </div>

            <div className="p-8">
              {/* ID Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Order ID</p>
                  <p className="text-xl font-mono font-bold text-slate-900">{orderSubmissionSuccess.new_order_id.substring(0, 8)}...</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Invoice ID</p>
                  <p className="text-xl font-mono font-bold text-slate-900">{orderSubmissionSuccess.new_invoice_id.substring(0, 8)}...</p>
                </div>
              </div>

              {/* Receipt Preview (Condensed) */}
              <div className="border rounded-2xl border-slate-200 overflow-hidden mb-8">
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <Receipt className="h-4 w-4" /> Receipt Summary
                  </h3>
                  <span className="text-xs font-medium text-slate-500">{orderItems.length} Items</span>
                </div>
                <div className="p-6 bg-white space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                  {orderItems.map((item) => (
                      <div key={item.product_id} className="flex justify-between text-sm">
                    <span className="text-slate-700 font-medium">
                      {item.quantity}× {item.product_name}
                      {item.garments && item.garments.length > 0 && (
                          <span className="block text-xs text-slate-400 font-normal pl-4 border-l-2 border-slate-100 mt-1">
                          With {item.garments.length} garment details
                        </span>
                      )}
                    </span>
                        <span className="text-slate-900 font-bold">${(item.price_at_sale * item.quantity).toFixed(2)}</span>
                      </div>
                  ))}
                  <div className="pt-4 mt-2 border-t border-slate-100 flex justify-between text-lg">
                    <span className="font-bold text-slate-700">Total Paid</span>
                    <span className="font-extrabold text-emerald-600">${totalAmountDue.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={() => window.print()}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-3.5 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  <Printer className="h-5 w-5" />
                  <span>Print Receipt</span>
                </button>
                <button
                    onClick={handleCreateAnotherOrder}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all hover:-translate-y-0.5"
                >
                  <Repeat className="h-5 w-5" />
                  <span>Start New Order</span>
                </button>
              </div>
            </div>
          </div>
        </div>
    )
  }

  // --- PAYMENT FORM VIEW ---
  return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Finalize Payment</h2>
            <p className="text-sm text-slate-500">Select a payment method to complete the order.</p>
          </div>
          <div className="sm:hidden bg-slate-900 text-white px-4 py-2 rounded-lg font-bold">
            ${totalAmountDue.toFixed(2)}
          </div>
        </div>

        {orderSubmissionError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">{orderSubmissionError}</p>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT PANEL: ORDER SUMMARY (5 Cols) */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Receipt className="h-4 w-4" /> Transaction Review
            </h3>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
              {/* Jagged Edge decoration (CSS trick or simplified visual) */}
              <div className="h-1.5 w-full bg-slate-900/5"></div>

              <div className="p-6">
                <div className="space-y-6">
                  {/* Items List */}
                  <div className="space-y-4">
                    {orderItems.map((item) => (
                        <div key={item.product_id} className="relative">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 pr-4">
                              <p className="text-sm font-bold text-slate-900">{item.product_name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                ${item.price_at_sale.toFixed(2)} × {item.quantity}
                              </p>
                            </div>
                            <span className="text-sm font-bold text-slate-900">
                          ${(item.price_at_sale * item.quantity).toFixed(2)}
                        </span>
                          </div>

                          {/* Garment Sub-items */}
                          {item.garments && item.garments.length > 0 && (
                              <div className="mt-2 pl-3 border-l-2 border-slate-100 ml-1 space-y-2">
                                {item.garments.map((garment, index) => (
                                    <div key={index} className="text-xs group">
                                      <div className="flex items-center gap-2 text-slate-600 font-medium">
                                        <Tag className="h-3 w-3 text-slate-400" />
                                        <span className="font-mono bg-slate-100 px-1 rounded text-slate-700">{garment.tag_id}</span>
                                      </div>
                                      <div className="pl-5 text-slate-500 mt-0.5 line-clamp-1">{garment.description}</div>
                                      {garment.notes && <div className="pl-5 text-amber-600 italic mt-0.5">{garment.notes}</div>}
                                    </div>
                                ))}
                              </div>
                          )}
                        </div>
                    ))}
                  </div>

                  {/* Total Section */}
                  <div className="pt-6 border-t-2 border-dashed border-slate-200">
                    <div className="flex justify-between items-center mb-1 text-slate-500">
                      <span className="text-sm font-medium">Subtotal</span>
                      <span className="font-medium">${totalAmountDue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-slate-900">Total Due</span>
                      <span className="text-2xl font-extrabold text-indigo-600">${totalAmountDue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: PAYMENT TERMINAL (7 Cols) */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">

                {/* Payment Mode Selection Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {[
                    { id: 'PAY_NOW', icon: CreditCard, label: 'Pay Now', desc: 'Settle immediately', color: 'text-emerald-600', ring: 'ring-emerald-500' },
                    { id: 'PAY_LATER', icon: Clock, label: 'Pay Later', desc: 'Pay on pickup', color: 'text-amber-600', ring: 'ring-amber-500' },
                    { id: 'USE_CREDIT', icon: Wallet, label: 'Store Credit', desc: 'Use balance', color: 'text-purple-600', ring: 'ring-purple-500' }
                  ].map((option) => {
                    const isSelected = paymentOption === option.id
                    const Icon = option.icon
                    return (
                        <label
                            key={option.id}
                            className={`
                        relative flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                        ${isSelected
                                ? `bg-white border-${option.color.split('-')[1]}-500 ${option.ring} ring-1 bg-slate-50/50 shadow-md`
                                : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-300'
                            }
                      `}
                        >
                          <input
                              type="radio"
                              name="paymentOption"
                              value={option.id}
                              checked={isSelected}
                              onChange={(e) => setPaymentOption(e.target.value as any)}
                              className="sr-only"
                          />
                          <Icon className={`h-8 w-8 mb-3 ${isSelected ? option.color : 'text-slate-400'}`} />
                          <span className={`font-bold text-sm ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>{option.label}</span>
                          <span className="text-[10px] text-slate-400 mt-1 font-medium">{option.desc}</span>
                          {isSelected && (
                              <div className={`absolute top-2 right-2 h-2 w-2 rounded-full ${option.color.replace('text', 'bg')}`} />
                          )}
                        </label>
                    )
                  })}
                </div>

                {/* Dynamic Payment Fields */}
                <div className={`space-y-6 transition-all duration-300 ${paymentOption === 'PAY_LATER' ? 'opacity-50 grayscale pointer-events-none' : 'opacity-100'}`}>
                  {/* Method Selector */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Payment Method</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { value: 'CASH', label: 'Cash', icon: Banknote },
                        { value: 'CREDIT_CARD', label: 'Card', icon: CreditCard },
                        { value: 'STORE_CREDIT', label: 'Credit', icon: Wallet },
                        { value: 'BANK_TRANSFER', label: 'Bank', icon: Building },
                      ].map((method) => (
                          <label
                              key={method.value}
                              className={`
                          flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all
                          ${paymentMethod === method.value
                                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                              }
                        `}
                          >
                            <input
                                type="radio"
                                name="paymentMethod"
                                value={method.value}
                                checked={paymentMethod === method.value}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                disabled={paymentOption === 'PAY_LATER'}
                                className="sr-only"
                            />
                            <method.icon className="h-5 w-5 mb-1.5" />
                            <span className="text-xs">{method.label}</span>
                          </label>
                      ))}
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Amount Received</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <DollarSign className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      </div>
                      <input
                          type="number"
                          step="0.01"
                          min="0"
                          max={totalAmountDue}
                          value={amountPaid}
                          onChange={(e) => setAmountPaid(Number(e.target.value))}
                          disabled={paymentOption === 'PAY_LATER'}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-mono text-lg font-bold text-slate-900"
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <span className="text-xs font-medium text-slate-400">USD</span>
                      </div>
                    </div>
                    {paymentOption !== 'PAY_LATER' && amountPaid < totalAmountDue && (
                        <div className="flex items-center gap-1.5 mt-2 text-red-600 text-xs font-medium animate-pulse">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Must cover full amount: ${totalAmountDue.toFixed(2)}
                        </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-8 mt-6 border-t border-slate-100">
                  <button
                      type="button"
                      onClick={onPrevious}
                      disabled={isSubmittingOrder}
                      className="flex-1 px-6 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button
                      type="submit"
                      disabled={isSubmittingOrder || (paymentOption === 'PAY_NOW' && amountPaid < totalAmountDue)}
                      className={`
                    flex-[2] px-6 py-3 rounded-xl text-white font-bold shadow-lg transition-all flex items-center justify-center gap-2
                    ${isSubmittingOrder || (paymentOption === 'PAY_NOW' && amountPaid < totalAmountDue)
                          ? 'bg-slate-300 cursor-not-allowed shadow-none'
                          : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-500/30 hover:-translate-y-0.5'
                      }
                  `}
                  >
                    {isSubmittingOrder ? (
                        <>
                          <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                    ) : (
                        <>
                          <CheckCircle className="h-5 w-5" />
                          {paymentOption === 'PAY_LATER' ? 'Complete Order (Unpaid)' : 'Confirm Payment & Order'}
                        </>
                    )}
                  </button>
                </div>

              </div>
            </form>
          </div>
        </div>
      </div>
  )
}

export default TakePaymentStep