import React from 'react'
import { useOrderForm } from '../hooks/useOrderForm'
import SelectCustomerStep from '../components/new-order/SelectCustomerStep'
import AddServicesStep from '../components/new-order/AddServicesStep'
import TakePaymentStep from '../components/new-order/TakePaymentStep'
import { CheckCircle, User, Package, CreditCard } from 'lucide-react'

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
    { number: 1, name: 'Select Customer', icon: User },
    { number: 2, name: 'Add Services', icon: Package },
    { number: 3, name: 'Payment', icon: CreditCard }
  ]

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-8">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = orderFormState.currentStep === step.number
          const isCompleted = orderFormState.currentStep > step.number
          const isAccessible = orderFormState.currentStep >= step.number

          return (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                    ${isCompleted
                      ? 'bg-green-600 border-green-600 text-white'
                      : isActive
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : isAccessible
                      ? 'border-gray-300 text-gray-500'
                      : 'border-gray-200 text-gray-300'
                    }
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`
                    mt-2 text-sm font-medium
                    ${isActive
                      ? 'text-blue-600'
                      : isCompleted
                      ? 'text-green-600'
                      : 'text-gray-500'
                    }
                  `}
                >
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`
                    w-16 h-0.5 mx-4 transition-colors
                    ${orderFormState.currentStep > step.number
                      ? 'bg-green-600'
                      : 'bg-gray-200'
                    }
                  `}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderCurrentStep = () => {
    switch (orderFormState.currentStep) {
      case 1:
        return (
          <SelectCustomerStep
            onNext={nextStep}
            onSelectCustomer={setCustomer}
            initialCustomer={orderFormState.customer}
          />
        )
      case 2:
        return (
          <AddServicesStep
            onNext={nextStep}
            onPrevious={prevStep}
            onAddOrderItem={addOrderItem}
            onRemoveOrderItem={removeOrderItem}
            onUpdateOrderItemQuantity={updateOrderItemQuantity}
            onUpdateOrderItemGarments={updateOrderItemGarments}
            initialOrderItems={orderFormState.items}
          />
        )
      case 3:
        return (
          <TakePaymentStep
            onPrevious={prevStep}
            onSubmitOrder={submitOrder}
            orderItems={orderFormState.items}
            totalAmountDue={getTotalAmount()}
            isSubmittingOrder={isSubmittingOrder}
            orderSubmissionError={orderSubmissionError}
            orderSubmissionSuccess={orderSubmissionSuccess}
            onResetForm={resetForm}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */} 
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Create New Order</h1>
        <p className="mt-1 text-sm text-gray-600">
          Follow the steps below to create a new order for your customer
        </p>
      </div>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Current Step Content */}
      <div className="max-w-6xl mx-auto">
        {renderCurrentStep()}
      </div>

      {/* Debug Info (only in development) {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Debug Info:</h4>
          <pre className="text-xs text-gray-600 overflow-auto">
            {JSON.stringify(orderFormState, null, 2)}
          </pre>
        </div>
      )}*/}
      
    </div>
  )
}

export default NewOrderPage