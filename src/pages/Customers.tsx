import React, { useEffect, useState, useMemo } from 'react'
import { Customer, CustomerService } from '../services/customerService'
import CustomerList from '../components/customers/CustomerList'
import CustomerDetail from '../components/customers/CustomerDetail'
import LoadingSpinner from '../components/LoadingSpinner'
import { AlertCircle, Users, Search } from 'lucide-react'

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchCustomers = async () => {
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

    fetchCustomers()
  }, [])

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
  }

  const handleCloseDetail = () => {
    setSelectedCustomer(null)
  }

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) {
      // If no search term, return all customers
      return customers
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase()

    return customers.filter(customer => {
      // Use optional chaining (?.) and nullish coalescing (?? '') for safer access
      // Convert to string and then to lowercase, handling potential nulls/undefineds
      const name = customer.customer_name?.toLowerCase() ?? '';
      const email = customer.customer_email?.toLowerCase() ?? '';
      const phone = customer.customer_phone_number?.toLowerCase() ?? ''; // Even if it's a number, toString() is implicit if it exists, but toLowerCase() needs a string. Better to ensure it's a string first if it could be a number.

      return (
        name.includes(lowerCaseSearchTerm) ||
        email.includes(lowerCaseSearchTerm) ||
        phone.includes(lowerCaseSearchTerm)
      )
    })
  }, [customers, searchTerm])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your customer database and relationships.
        </p>
      </div>

      {/* Filter Section */}
      <div className="bg-white shadow-sm rounded-lg p-4 flex items-center space-x-3">
        <Search className="h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Filter customers by name, email, or phone..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* Main Content Area */}
      {selectedCustomer ? (
        <CustomerDetail customer={selectedCustomer} onClose={handleCloseDetail} />
      ) : (
        <CustomerList
          customers={filteredCustomers}
          loading={loading}
          error={error}
          selectedCustomer={selectedCustomer}
          onSelectCustomer={handleSelectCustomer}
        />
      )}
    </div>
  )
}

export default Customers