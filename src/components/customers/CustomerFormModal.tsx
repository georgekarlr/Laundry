import React, { useEffect, useState } from 'react'
import { X, User, Phone, Mail, FileText } from 'lucide-react'
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
        initialCustomer.customer_preferences ? JSON.stringify(initialCustomer.customer_preferences, null, 2) : ''
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

  const parsePreferences = (text: string): { ok: boolean; value: any | null; message?: string } => {
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
            <div className="flex items-center space-x-3">
              <User className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">{headerTitle}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="personName" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person
              </label>
              <input
                type="text"
                id="personName"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Optional"
              />
            </div>

            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name
              </label>
              <input
                type="text"
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., ACME Corp or John Doe"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., +1 555-123-4567"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <label htmlFor="preferences" className="block text-sm font-medium text-gray-700 mb-2">
                Preferences (JSON)
              </label>
              <div className="relative">
                <div className="absolute top-2 left-2 text-gray-400">
                  <FileText className="h-4 w-4" />
                </div>
                <textarea
                  id="preferences"
                  rows={4}
                  value={preferencesText}
                  onChange={(e) => setPreferencesText(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder={`Optional JSON, e.g., {\n  "notes": "No starch"\n}`}
                />
              </div>
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
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                ) : (
                  submitText
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CustomerFormModal
