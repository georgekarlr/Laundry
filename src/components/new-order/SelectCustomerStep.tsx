import React, { useState, useEffect, useMemo } from 'react'
import { Customer, CustomerService } from '../../services/customerService'
import { CustomerData } from '../../types/order'
import { Search, UserPlus, ArrowRight, X, User, Phone, Mail, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
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
    setCreateLoading(false)
  }

  // --- RENDER: CREATE MODE ---
  if (isCreatingNewCustomer) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Create New Customer</h2>
              <p className="text-sm text-slate-500">Enter the details below to register a new client.</p>
            </div>
            <button
                onClick={handleCancelCreate}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {createError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm font-medium text-red-700">{createError}</p>
              </div>
          )}

          {createSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <p className="text-sm font-medium text-emerald-700">{createSuccess}</p>
              </div>
          )}

          <div className="bg-white shadow-lg shadow-slate-200/50 border border-slate-100 rounded-2xl p-6 sm:p-8">
            <form onSubmit={handleSubmitNewCustomer} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Customer Name <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        required
                        value={newCustomerName}
                        onChange={(e) => setNewCustomerName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                        placeholder="e.g. John Doe"
                    />
                  </div>
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Phone Number <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                        type="tel"
                        required
                        value={newCustomerPhone}
                        onChange={(e) => setNewCustomerPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                        placeholder="e.g. (555) 123-4567"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Email Address <span className="font-normal text-slate-400">(Optional)</span></label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                        type="email"
                        value={newCustomerEmail}
                        onChange={(e) => setNewCustomerEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                        placeholder="e.g. john@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-6 border-t border-slate-100 mt-2">
                <button
                    type="button"
                    onClick={handleCancelCreate}
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 transition-all"
                >
                  Cancel
                </button>
                <button
                    type="submit"
                    disabled={createLoading}
                    className="flex-[2] px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-200 flex justify-center items-center"
                >
                  {createLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                  ) : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
    )
  }

  // --- RENDER: SELECT MODE ---
  return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Select Customer</h2>
            <p className="text-sm text-slate-500">Search for an existing client or add a new one.</p>
          </div>

          {/* Error Alert */}
          {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2 px-4 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-xs font-medium text-red-700">{error}</p>
              </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
                type="text"
                placeholder="Search by name, email, or phone..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
              onClick={handleCreateNewCustomer}
              className="flex items-center justify-center space-x-2 px-5 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/20 transition-all font-medium whitespace-nowrap"
          >
            <UserPlus className="h-5 w-5" />
            <span>New Customer</span>
          </button>
        </div>

        {/* Customer List */}
        <div
            role="radiogroup"
            aria-label="Select a customer"
            className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar"
        >
          {loading ? (
              // Skeleton Loader
              [1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center p-4 bg-white border border-slate-100 rounded-xl animate-pulse">
                    <div className="h-10 w-10 bg-slate-100 rounded-full mr-4" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 bg-slate-100 rounded" />
                      <div className="h-3 w-1/2 bg-slate-100 rounded" />
                    </div>
                  </div>
              ))
          ) : filteredCustomers.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
                <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                  <User className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-slate-900 font-medium">No customers found</p>
                <p className="text-sm text-slate-500 mt-1">Try adjusting your search or add a new customer.</p>
              </div>
          ) : (
              // List Items
              filteredCustomers.map((customer) => {
                const isSelected = selectedCustomer?.customer_id === customer.customer_id
                return (
                    <label
                        key={customer.customer_id}
                        className={`
                  relative flex items-center p-4 cursor-pointer transition-all duration-200 border rounded-xl group
                  ${isSelected
                            ? 'bg-indigo-50/50 border-indigo-500 ring-1 ring-indigo-500 shadow-sm z-10'
                            : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
                        }
                `}
                    >
                      <input
                          type="radio"
                          name="selectedCustomer"
                          className="sr-only" // Hidden visually but accessible
                          checked={isSelected}
                          onChange={() => handleSelectCustomer(customer)}
                      />

                      {/* Avatar Placeholder */}
                      <div className={`
                  flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold mr-4 transition-colors
                  ${isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'}
                `}>
                        {customer.customer_name.charAt(0).toUpperCase()}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-base font-bold truncate ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                            {customer.customer_name}
                          </p>
                          {isSelected && (
                              <div className="hidden sm:flex items-center text-indigo-600 text-xs font-bold uppercase tracking-wider bg-indigo-100 px-2 py-1 rounded-md">
                                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Selected
                              </div>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                          {customer.customer_phone_number && (
                              <span className={`flex items-center ${isSelected ? 'text-indigo-700' : 'text-slate-500'}`}>
                        <Phone className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                                {customer.customer_phone_number}
                      </span>
                          )}
                          {customer.customer_email && (
                              <span className={`flex items-center ${isSelected ? 'text-indigo-700' : 'text-slate-500'}`}>
                        <Mail className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                                {customer.customer_email}
                      </span>
                          )}
                        </div>
                      </div>

                      {/* Mobile Selection Indicator */}
                      <div className={`
                  ml-4 h-5 w-5 rounded-full border flex items-center justify-center transition-colors
                  ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}
                `}>
                        {isSelected && <div className="h-2 w-2 bg-white rounded-full" />}
                      </div>
                    </label>
                )
              })
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
              onClick={handleNext}
              disabled={!selectedCustomer}
              className={`
            flex items-center space-x-2 px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg
            ${selectedCustomer
                  ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30 transform hover:-translate-y-0.5'
                  : 'bg-slate-300 cursor-not-allowed opacity-70'
              }
          `}
          >
            <span>Continue to Services</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
  )
}

export default SelectCustomerStep