import React, { useEffect, useState, useMemo } from 'react'
import { Customer, CustomerService } from '../services/customerService'
import CustomerList from '../components/customers/CustomerList'
import CustomerDetail from '../components/customers/CustomerDetail'
import { AlertCircle, Users, Search, Plus, Filter } from 'lucide-react'
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
      return customers
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase()
    return customers.filter(customer => {
      const name = customer.customer_name?.toLowerCase() ?? '';
      const email = customer.customer_email?.toLowerCase() ?? '';
      const phone = customer.customer_phone_number?.toLowerCase() ?? '';
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
      <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 hidden sm:block">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Customers</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                  {customers.length} Total
                </span>
                </div>
                <p className="mt-1 text-sm text-slate-500 font-medium">
                  Manage your client database and update contact details.
                </p>
              </div>
            </div>
            <button
                onClick={openAddModal}
                className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Customer
            </button>
          </div>

          {/* Error State */}
          {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
          )}

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

            {/* Filter Ribbon */}
            <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="relative max-w-lg group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-slate-300" />
                </div>
              </div>
            </div>

            {/* List Area */}
            <div className="min-h-[400px]">
              <CustomerList
                  customers={filteredCustomers}
                  loading={loading}
                  error={error}
                  selectedCustomer={selectedCustomer}
                  onSelectCustomer={handleSelectCustomer}
                  onEditCustomer={handleEditCustomer}
              />
            </div>
          </div>

          {/* Modals */}
          {viewingCustomer && (
              <CustomerDetail
                  customer={viewingCustomer}
                  onClose={handleCloseDetail}
                  onEdit={handleEditCustomer}
              />
          )}

          <CustomerFormModal
              isOpen={showForm}
              onClose={() => setShowForm(false)}
              onSave={handleSave}
              initialCustomer={editingCustomer || undefined}
              loading={formLoading}
          />
        </div>
      </div>
  )
}

export default Customers