import React, { useEffect, useState } from 'react'
import { X, User, Save, AlertCircle } from 'lucide-react'
import type { Customer } from '../../services/customerService'

export interface CustomerFormValues {
  person_name: string | null
  customer_name: string
  customer_phone_number: string
  customer_email: string | null
  customer_preferences: any | null
}

interface CustomerFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (values: CustomerFormValues, customerId?: string) => Promise<void> | void
  initialCustomer?: Customer | null
  loading?: boolean
  title?: string
  submitLabel?: string
}

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
                                                               isOpen,
                                                               onClose,
                                                               onSave,
                                                               initialCustomer,
                                                               loading = false,
                                                               title,
                                                               submitLabel,
                                                             }) => {
  const [personName, setPersonName] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [preferencesText, setPreferencesText] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) return
    if (initialCustomer) {
      setPersonName(initialCustomer.person_name || '')
      setCustomerName(initialCustomer.customer_name || '')
      setPhone(initialCustomer.customer_phone_number || '')
      setEmail(initialCustomer.customer_email || '')
      setPreferencesText(
          initialCustomer.customer_preferences
              ? JSON.stringify(initialCustomer.customer_preferences, null, 2)
              : ''
      )
    } else {
      setPersonName('')
      setCustomerName('')
      setPhone('')
      setEmail('')
      setPreferencesText('')
    }
    setError('')
  }, [isOpen, initialCustomer])

  const isValidEmail = (val: string) => {
    if (!val) return true
    return /.+@.+\..+/.test(val)
  }

  const parsePreferences = (
      text: string
  ): { ok: boolean; value: any | null; message?: string } => {
    const trimmed = text.trim()
    if (!trimmed) return { ok: true, value: null }
    try {
      const obj = JSON.parse(trimmed)
      return { ok: true, value: obj }
    } catch (e: any) {
      return { ok: false, value: null, message: 'Preferences must be valid JSON' }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!customerName.trim()) {
      setError('Customer name is required.')
      return
    }
    if (!phone.trim()) {
      setError('Phone number is required.')
      return
    }
    if (!isValidEmail(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }

    const pref = parsePreferences(preferencesText)
    if (!pref.ok) {
      setError(pref.message || 'Invalid JSON in preferences')
      return
    }

    onSave(
        {
          person_name: personName.trim() || null,
          customer_name: customerName.trim(),
          customer_phone_number: phone.trim(),
          customer_email: email.trim() || null,
          customer_preferences: pref.value,
        },
        initialCustomer?.customer_id
    )
  }

  if (!isOpen) return null

  const headerTitle = title || (initialCustomer ? 'Edit Customer' : 'Add New Customer')
  const submitText = submitLabel || (initialCustomer ? 'Update Customer' : 'Add Customer')

  // Common styles
  const labelStyle = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1"
  const inputStyle = "w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all"

  return (
      // High Z-index container to sit above everything in your app
      <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">

        {/*
        LAYER 1: The Backdrop
        - Fixed position
        - Negative Z-index relative to content or lower in the stack
        - Handles the Blur and Color
      */}
        <div
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
            onClick={onClose}
            style={{ backgroundColor: 'rgba(17, 24, 39, 0.5)' }} // Fallback color
        />

        {/*
        LAYER 2: The Scrollable Container
        - Fixed position to cover screen
        - Higher Z-index than backdrop
        - Handles centering the modal
      */}
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">

            {/*
            LAYER 3: The Modal Panel
            - Relative position ensures it sits strictly ON TOP of the backdrop
            - Background white to ensure no transparency bleed
            - Shadow-2xl for "pop" effect
          */}
            <div
                className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-100"
                style={{ backgroundColor: '#ffffff' }}
            >

              {/* Header */}
              <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900" id="modal-title">{headerTitle}</h3>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none"
                    aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Error Message */}
              {error && (
                  <div className="mx-6 mt-6 p-4 rounded-lg bg-red-50 border border-red-100 flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-800 font-medium">{error}</p>
                  </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">

                {/* Contact Person */}
                <div>
                  <label htmlFor="personName" className={labelStyle}>
                    Contact Person
                  </label>
                  <input
                      type="text"
                      id="personName"
                      value={personName}
                      onChange={(e) => setPersonName(e.target.value)}
                      className={inputStyle}
                      placeholder="Optional name"
                  />
                </div>

                {/* Customer Name */}
                <div>
                  <label htmlFor="customerName" className={labelStyle}>
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                      type="text"
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className={inputStyle}
                      placeholder="e.g., ACME Corp"
                      required
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phone" className={labelStyle}>
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputStyle}
                      placeholder="+1 555-000-0000"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="email" className={labelStyle}>
                    Email Address
                  </label>
                  <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputStyle}
                      placeholder="john@example.com"
                  />
                </div>

                {/* Preferences */}
                <div>
                  <label htmlFor="preferences" className={labelStyle}>
                    Preferences (JSON)
                  </label>
                  <textarea
                      id="preferences"
                      rows={4}
                      value={preferencesText}
                      onChange={(e) => setPreferencesText(e.target.value)}
                      className={`${inputStyle} font-mono text-sm leading-relaxed`}
                      placeholder={`{\n  "notes": "VIP Customer",\n  "delivery": "Morning"\n}`}
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center space-x-3 pt-4 mt-2 border-t border-gray-100">
                  <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none"
                      disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-colors flex items-center justify-center space-x-2 disabled:opacity-70 focus:outline-none"
                      disabled={loading}
                  >
                    {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>{submitText}</span>
                        </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
  )
}

export default CustomerFormModal