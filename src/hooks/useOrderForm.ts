import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { OrderService } from '../services/orderService'
import {
  OrderFormState,
  CustomerData,
  OrderItem,
  PaymentDetails,
  CreateOrderResult,
  UseOrderFormReturn,
  CreateOrderPayload
} from '../types/order'

const initialState: OrderFormState = {
  currentStep: 1,
  customer: null,
  items: [],
  payment: null
}

export const useOrderForm = (): UseOrderFormReturn => {
  const { persona } = useAuth()
  const [orderFormState, setOrderFormState] = useState<OrderFormState>(initialState)
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [orderSubmissionError, setOrderSubmissionError] = useState<string | null>(null)
  const [orderSubmissionSuccess, setOrderSubmissionSuccess] = useState<CreateOrderResult | null>(null)

  // Step navigation functions
  const nextStep = () => {
    setOrderFormState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 3)
    }))
  }

  const prevStep = () => {
    setOrderFormState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1)
    }))
  }

  const goToStep = (step: number) => {
    setOrderFormState(prev => ({
      ...prev,
      currentStep: Math.max(1, Math.min(step, 3))
    }))
  }

  // Data update functions
  const setCustomer = (customer: CustomerData) => {
    setOrderFormState(prev => ({
      ...prev,
      customer
    }))
  }

  const addOrderItem = (item: OrderItem) => {
    setOrderFormState(prev => {
      const existingItemIndex = prev.items.findIndex(i => i.product_id === item.product_id)
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity and merge garments
        const updatedItems = [...prev.items]
        const existingItem = updatedItems[existingItemIndex]
        const existingGarments = existingItem.garments || []
        const newGarments = item.garments || []
        
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + item.quantity,
          garments: [...existingGarments, ...newGarments]
        }
        return {
          ...prev,
          items: updatedItems
        }
      } else {
        // Add new item
        return {
          ...prev,
          items: [...prev.items, item]
        }
      }
    })
  }

  const removeOrderItem = (productId: string) => {
    setOrderFormState(prev => ({
      ...prev,
      items: prev.items.filter(item => item.product_id !== productId)
    }))
  }

  const updateOrderItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeOrderItem(productId)
      return
    }

    setOrderFormState(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.product_id === productId
          ? { ...item, quantity }
          : item
      )
    }))
  }

  const updateOrderItemGarments = (productId: string, garments: GarmentData[]) => {
    setOrderFormState(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.product_id === productId
          ? { ...item, garments }
          : item
      )
    }))
  }

  const setPaymentDetails = (payment: PaymentDetails) => {
    setOrderFormState(prev => ({
      ...prev,
      payment
    }))
  }

  const getTotalAmount = (): number => {
    return orderFormState.items.reduce((total, item) => {
      return total + (item.price_at_sale * item.quantity)
    }, 0)
  }

  const submitOrder = async (
    paymentOption: 'PAY_LATER' | 'PAY_NOW' | 'USE_CREDIT',
    paymentMethod?: string | null,
    amountPaid?: number
  ) => {
    if (!orderFormState.customer || !orderFormState.customer.customer_id) {
      setOrderSubmissionError('Customer is required')
      return
    }

    if (orderFormState.items.length === 0) {
      setOrderSubmissionError('At least one item is required')
      return
    }

    if (!persona) {
      setOrderSubmissionError('User persona is required')
      return
    }

    setIsSubmittingOrder(true)
    setOrderSubmissionError(null)
    setOrderSubmissionSuccess(null)

    try {
      const payload: CreateOrderPayload = {
        p_customer_id: orderFormState.customer.customer_id,
        p_order_items: orderFormState.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          garments: item.garments || []
        })),
        p_payment_option: paymentOption,
        p_payment_method: paymentMethod || null,
        p_amount_paid: amountPaid || 0,
        p_person_name: persona.personName || persona.loginName || 'Unknown'
      }

      const result = await OrderService.createOrder(payload)

      if (result.success && result.data) {
        setOrderSubmissionSuccess(result.data)
        // Update payment details in state
        setPaymentDetails({
          payment_option: paymentOption,
          payment_method: paymentMethod || null,
          amount_paid: amountPaid || 0
        })
      } else {
        setOrderSubmissionError(result.message)
      }
    } catch (error) {
      setOrderSubmissionError('An unexpected error occurred')
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  const resetForm = () => {
    setOrderFormState(initialState)
    setIsSubmittingOrder(false)
    setOrderSubmissionError(null)
    setOrderSubmissionSuccess(null)
  }

  return {
    orderFormState,
    isSubmittingOrder,
    orderSubmissionError,
    orderSubmissionSuccess,
    nextStep,
    prevStep,
    goToStep,
    setCustomer,
    addOrderItem,
    removeOrderItem,
    updateOrderItemQuantity,
    updateOrderItemGarments,
    setPaymentDetails,
    submitOrder,
    resetForm,
    getTotalAmount
  }
}