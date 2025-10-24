import React, { useState, useEffect, useMemo } from 'react'
import { Customer, CustomerService } from '../../services/customerService'
import { CustomerData } from '../../types/order'
import { Search, UserPlus, ArrowRight, X, User, Phone, Mail, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'


interface SelectCustomerStepProps {
  onNext: () => void
  onSelectCustomer: (customer: CustomerData) => void
  initialCustomer?: CustomerData | null
}

const SelectCustomerStep: React.FC<SelectCustomerStepProps> = ({
  onNext,
  onSelectCustomer,
  initialCustomer
}) => {
    const { persona } = useAuth()

    const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  
  // New customer creation state
  const [isCreatingNewCustomer, setIsCreatingNewCustomer] = useState(false)
  const [newCustomerName, setNewCustomerName] = useState('')
  const [newCustomerPhone, setNewCustomerPhone] = useState('')
  const [newCustomerEmail, setNewCustomerEmail] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')

  useEffect(() => {
    loadCustomers()
  }, [])

  useEffect(() => {
    if (initialCustomer && initialCustomer.customer_id) {
      const customer = customers.find(c => c.customer_id === initialCustomer.customer_id)
      if (customer) {
        setSelectedCustomer(customer)
      }
    }
  }, [initialCustomer, customers])

  const loadCustomers = async () => {
    setLoading(true)
    setError('')
    const result = await CustomerService.getAllCustomers()
    if (result.success && result.data) {
      setCustomers(result.data)
    } else {
      setError(result.message)
    }
    setLoading(false)
  }

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) {
      return customers
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase()
    return customers.filter(customer => {
      const name = customer.customer_name?.toLowerCase() ?? ''
      const email = customer.customer_email?.toLowerCase() ?? ''
      const phone = customer.customer_phone_number?.toLowerCase() ?? ''

      return (
        name.includes(lowerCaseSearchTerm) ||
        email.includes(lowerCaseSearchTerm) ||
        phone.includes(lowerCaseSearchTerm)
      )
    })
  }, [customers, searchTerm])

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    const customerData: CustomerData = {
      customer_id: customer.customer_id,
      customer_name: customer.customer_name,
      customer_phone_number: customer.customer_phone_number,
      customer_email: customer.customer_email || undefined
    }
    onSelectCustomer(customerData)
  }

  const handleNext = () => {
    if (selectedCustomer) {
      onNext()
    }
  }

  const handleCreateNewCustomer = () => {
    setIsCreatingNewCustomer(true)
    setCreateError('')
    setCreateSuccess('')
    setNewCustomerName('')
    setNewCustomerPhone('')
    setNewCustomerEmail('')
  }

  const handleCancelCreate = () => {
    setIsCreatingNewCustomer(false)
    setCreateError('')
    setCreateSuccess('')
    setNewCustomerName('')
    setNewCustomerPhone('')
    setNewCustomerEmail('')
  }

  const handleSubmitNewCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)
    setCreateError('')
    setCreateSuccess('')

    if (!newCustomerName.trim()) {
      setCreateError('Customer name is required')
      setCreateLoading(false)
      return
    }

    if (!newCustomerPhone.trim()) {
      setCreateError('Phone number is required')
      setCreateLoading(false)
      return
    }

    try {
      const result = await CustomerService.createCustomer(
          persona?.personName || 'admin',
        newCustomerName.trim(),
        newCustomerPhone.trim(),
        newCustomerEmail.trim() || undefined
      )

        console.log(result);

      if (result.success && result.data) {
        setCreateSuccess('Customer created successfully!')
        
        // Select the newly created customer
        const newCustomerData: CustomerData = {
          customer_id: result.data.customer_id,
          customer_name: result.data.customer_name,
          customer_phone_number: result.data.customer_phone_number,
          customer_email: result.data.customer_email || undefined
        }
        
        onSelectCustomer(newCustomerData)
        setSelectedCustomer(result.data)
        
        // Refresh the customer list
        await loadCustomers()
        
        // Close the form and proceed to next step
        setIsCreatingNewCustomer(false)
        setTimeout(() => {
          onNext()
        }, 500)
      } else {
        setCreateError(result.message)
      }
    } catch (error) {
      setCreateError('Failed to create customer')
    } finally {
      setCreateLoading(false)
    }
  }

  if (isCreatingNewCustomer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create New Customer</h2>
            <p className="text-sm text-gray-600">Add a new customer to your database</p>
          </div>
          <button
            onClick={handleCancelCreate}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {createError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{createError}</p>
          </div>
        )}

        {createSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-700">{createSuccess}</p>
          </div>
        )}

        <div className="bg-white shadow-sm rounded-lg p-6">
          <form onSubmit={handleSubmitNewCustomer} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter customer name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  required
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={newCustomerEmail}
                  onChange={(e) => setNewCustomerEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCancelCreate}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {createLoading ? 'Creating...' : 'Create Customer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Select Customer</h2>
        <p className="text-sm text-gray-600">Choose an existing customer or create a new one</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={handleCreateNewCustomer}
          className="ml-4 flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          <span>New Customer</span>
        </button>
      </div>

      <div role="radiogroup" aria-label="Select a customer" className="bg-white shadow-sm rounded-lg divide-y divide-gray-100">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading customers...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">No customers found.</div>
        ) : (
          filteredCustomers.map((customer) => {
            const isSelected = selectedCustomer?.customer_id === customer.customer_id
            return (
              <label
                key={customer.customer_id}
                className={`flex items-start p-4 cursor-pointer transition-colors ${
                  isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="selectedCustomer"
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  checked={isSelected}
                  onChange={() => handleSelectCustomer(customer)}
                />
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">{customer.customer_name}</p>
                    {isSelected && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Selected
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
                    {customer.customer_phone_number && (
                      <span className="inline-flex items-center">
                        <Phone className="h-4 w-4 mr-1 text-gray-400" />
                        {customer.customer_phone_number}
                      </span>
                    )}
                    {customer.customer_email && (
                      <span className="inline-flex items-center">
                        <Mail className="h-4 w-4 mr-1 text-gray-400" />
                        {customer.customer_email}
                      </span>
                    )}
                  </div>
                </div>
              </label>
            )
          })
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={!selectedCustomer}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span>Next: Add Services</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default SelectCustomerStep