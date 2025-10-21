import React, { useEffect, useState, useMemo } from 'react'
import { Customer, CustomerService } from '../services/customerService'
import CustomerList from '../components/customers/CustomerList'
import CustomerDetail from '../components/customers/CustomerDetail'
import LoadingSpinner from '../components/LoadingSpinner'
import { AlertCircle, Users, Search, Plus } from 'lucide-react'
import CustomerFormModal, { CustomerFormValues } from '../components/customers/CustomerFormModal'

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null)

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
    setViewingCustomer(customer)
  }

  const handleCloseDetail = () => {
    setViewingCustomer(null)
  }

  const openAddModal = () => {
    setEditingCustomer(null)
    setShowForm(true)
  }

  const handleEditCustomer = (cust: Customer) => {
    setEditingCustomer(cust)
    setShowForm(true)
  }

  const handleSave = async (values: CustomerFormValues, customerId?: string) => {
    setFormLoading(true)
    try {
      if (customerId) {
        const res = await CustomerService.updateCustomer(customerId, {
          person_name: values.person_name,
          customer_name: values.customer_name,
          customer_phone_number: values.customer_phone_number,
          customer_email: values.customer_email,
          customer_preferences: values.customer_preferences,
        })
        if (!res.success || !res.data) {
          alert(res.message)
          return
        }
        const updated = res.data
        setCustomers(prev => prev.map(c => c.customer_id === updated.customer_id ? updated : c))
        setSelectedCustomer(prev => (prev && prev.customer_id === updated.customer_id ? updated : prev))
      } else {
        const res = await CustomerService.createCustomer(
          values.person_name,
          values.customer_name,
          values.customer_phone_number,
          values.customer_email || null,
          values.customer_preferences || null,
        )
        if (!res.success || !res.data) {
          alert(res.message)
          return
        }
        const created = res.data
        setCustomers(prev => [...prev, created].sort((a, b) => a.customer_name.localeCompare(b.customer_name)))
      }
      setShowForm(false)
      setEditingCustomer(null)
    } finally {
      setFormLoading(false)
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your customer database and relationships.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </button>
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
      <CustomerList
        customers={filteredCustomers}
        loading={loading}
        error={error}
        selectedCustomer={selectedCustomer}
        onSelectCustomer={handleSelectCustomer}
        onEditCustomer={handleEditCustomer}
      />

      {viewingCustomer && (
        <CustomerDetail customer={viewingCustomer} onClose={handleCloseDetail} onEdit={handleEditCustomer} />
      )}

      <CustomerFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
        initialCustomer={editingCustomer || undefined}
        loading={formLoading}
      />
    </div>
  )
}

export default Customers