import React from 'react'
import { Customer } from '../../services/customerService'
import { User, Phone, Mail } from 'lucide-react'

interface CustomerListProps {
  customers: Customer[]
  loading: boolean
  error: string
  selectedCustomer: Customer | null
  onSelectCustomer: (customer: Customer) => void
}

const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  loading,
  error,
  selectedCustomer,
  onSelectCustomer,
}) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading customers...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    )
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No customers found.</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Customer List</h3>
      </div>
      <ul className="divide-y divide-gray-200">
        {customers.map((customer) => (
          <li
            key={customer.customer_id}
            className={\`p-4 hover:bg-gray-50 cursor-pointer ${
              selectedCustomer?.customer_id === customer.customer_id ? 'bg-blue-50' : ''
            }`}
            onClick={() => onSelectCustomer(customer)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{customer.customer_name}</p>
                  <p className="text-sm text-gray-500 flex items-center space-x-1">
                    <Phone className="h-3 w-3" />
                    <span>{customer.customer_phone_number}</span>
                  </p>
                  {customer.customer_email && (
                    <p className="text-sm text-gray-500 flex items-center space-x-1">
                      <Mail className="h-3 w-3" />
                      <span>{customer.customer_email}</span>
                    </p>
                  )}
                </div>
              </div>
              {selectedCustomer?.customer_id === customer.customer_id && (
                <span className="text-blue-600 text-sm font-medium">Selected</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CustomerList
