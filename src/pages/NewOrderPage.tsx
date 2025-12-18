import React from 'react'
import { useOrderForm } from '../hooks/useOrderForm'
import SelectCustomerStep from '../components/new-order/SelectCustomerStep'
import AddServicesStep from '../components/new-order/AddServicesStep'
import TakePaymentStep from '../components/new-order/TakePaymentStep'
import { CheckCircle2, User, Package, CreditCard } from 'lucide-react'

const NewOrderPage: React.FC = () => {
  const {
    orderFormState,
    isSubmittingOrder,
    orderSubmissionError,
    orderSubmissionSuccess,
    nextStep,
    prevStep,
    setCustomer,
    addOrderItem,
    removeOrderItem,
    updateOrderItemQuantity,
    updateOrderItemGarments,
    submitOrder,
    resetForm,
    getTotalAmount
  } = useOrderForm()

  const steps = [
    { number: 1, name: 'Customer', icon: User },
    { number: 2, name: 'Services', icon: Package },
    { number: 3, name: 'Payment', icon: CreditCard }
  ]

  const renderStepIndicator = () => (
      <nav aria-label="Progress" className="max-w-4xl mx-auto mb-12 px-4">
        <ol className="flex items-center justify-between w-full">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = orderFormState.currentStep === step.number
            const isCompleted = orderFormState.currentStep > step.number

            return (
                <li key={step.number} className={`flex items-center ${index !== steps.length - 1 ? 'flex-1' : ''}`}>
                  <div className="flex flex-col items-center relative">
                    <div
                        className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 shadow-sm
                    ${isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : isActive
                                ? 'bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-100'
                                : 'bg-white border-slate-200 text-slate-400'
                        }
                  `}
                    >
                      {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <div className="absolute -bottom-7 whitespace-nowrap hidden sm:block">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-indigo-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {step.name}
                  </span>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                      <div className="flex-1 mx-4 h-0.5 bg-slate-200 relative overflow-hidden">
                        <div className="absolute inset-0 bg-emerald-500 transition-all duration-500" style={{ width: isCompleted ? '100%' : '0%' }} />
                      </div>
                  )}
                </li>
            )
          })}
        </ol>
      </nav>
  )

  const renderCurrentStep = () => {
    switch (orderFormState.currentStep) {
      case 1:
        return <SelectCustomerStep onNext={nextStep} onSelectCustomer={setCustomer} initialCustomer={orderFormState.customer} />
      case 2:
        return <AddServicesStep onNext={nextStep} onPrevious={prevStep} onAddOrderItem={addOrderItem} onRemoveOrderItem={removeOrderItem} onUpdateOrderItemQuantity={updateOrderItemQuantity} onUpdateOrderItemGarments={updateOrderItemGarments} initialOrderItems={orderFormState.items} />
      case 3:
        return <TakePaymentStep onPrevious={prevStep} onSubmitOrder={submitOrder} orderItems={orderFormState.items} totalAmountDue={getTotalAmount()} isSubmittingOrder={isSubmittingOrder} orderSubmissionError={orderSubmissionError} orderSubmissionSuccess={orderSubmissionSuccess} onResetForm={resetForm} />
      default:
        return null
    }
  }

  return (
      <div className="min-h-screen bg-slate-50/80 -mt-8 pt-10 px-4 pb-20 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-5xl mx-auto mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create New Order</h1>
            <p className="mt-1 text-sm text-slate-500 font-medium">Follow the steps to process the transaction.</p>
          </div>
          {orderFormState.customer && orderFormState.currentStep > 1 && (
              <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-right-4">
                <p className="text-[10px] font-bold text-indigo-400 uppercase">Active Customer</p>
                <p className="text-sm font-bold text-indigo-900">{orderFormState.customer.customer_name}</p>
              </div>
          )}
        </div>

        {/* Stepper */}
        {renderStepIndicator()}

        {/* FIXED WIZARD CONTAINER */}
        <div className="max-w-5xl mx-auto">
          <div className="
          bg-white
          rounded-[2rem]
          shadow-[0_20px_50px_rgba(0,0,0,0.05)]
          border border-slate-200
          overflow-hidden
          transition-all
          duration-500
        ">
            {/* Internal Content Area with proper padding (the "Edge Fix") */}
            <div className="p-4 sm:p-8 lg:p-10 bg-white">
              <div className="min-h-[400px]">
                {renderCurrentStep()}
              </div>
            </div>

            {/* Subtle footer strip inside the card to anchor the edges */}
            <div className="h-2 bg-slate-50 border-t border-slate-100" />
          </div>

          {/* Support Footer */}
          <div className="mt-10 flex items-center justify-center gap-6 text-slate-400">
            <div className="h-px w-12 bg-slate-200" />
            <p className="text-xs font-semibold uppercase tracking-widest">Order Management System</p>
            <div className="h-px w-12 bg-slate-200" />
          </div>
        </div>
      </div>
  )
}

export default NewOrderPage