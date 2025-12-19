import React from 'react'
import { Customer } from '../../services/customerService'
import { User, Phone, Mail, Edit3, ChevronRight, AlertCircle, Search } from 'lucide-react'

interface CustomerListProps {
    customers: Customer[]
    loading: boolean
    error: string
    selectedCustomer: Customer | null
    onSelectCustomer: (customer: Customer) => void
    onEditCustomer?: (customer: Customer) => void
}

const CustomerList: React.FC<CustomerListProps> = ({
                                                       customers,
                                                       loading,
                                                       error,
                                                       selectedCustomer,
                                                       onSelectCustomer,
                                                       onEditCustomer,
                                                   }) => {

    // Helper to get initials (Visual only, no logic change)
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    }

    // 1. Skeleton Loader
    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="divide-y divide-slate-100">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
                            <div className="h-10 w-10 rounded-full bg-slate-100" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-1/3 bg-slate-100 rounded" />
                                <div className="h-3 w-1/4 bg-slate-50 rounded" />
                            </div>
                            <div className="h-8 w-16 bg-slate-50 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // 2. Error State
    if (error) {
        return (
            <div className="bg-white rounded-2xl border border-red-100 p-8 text-center shadow-sm">
                <div className="mx-auto h-12 w-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Unable to load customers</h3>
                <p className="text-red-600 mt-1 max-w-sm mx-auto">{error}</p>
            </div>
        )
    }

    // 3. Empty State
    if (customers.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                <div className="mx-auto h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">No customers found</h3>
                <p className="text-slate-500 mt-1">Try adjusting your search terms or add a new customer.</p>
            </div>
        )
    }

    // 4. Data List
    return (
        <div className="bg-white shadow-sm rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Client Directory</h3>
                <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
          {customers.length} Records
        </span>
            </div>

            <ul className="divide-y divide-slate-100">
                {customers.map((customer) => {
                    const isSelected = selectedCustomer?.customer_id === customer.customer_id

                    return (
                        <li
                            key={customer.customer_id}
                            onClick={() => onSelectCustomer(customer)}
                            className={`
                group p-4 transition-all duration-200 cursor-pointer border-l-4
                ${isSelected
                                ? 'bg-indigo-50/60 border-l-indigo-500'
                                : 'bg-white border-l-transparent hover:bg-slate-50 hover:border-l-slate-300'
                            }
              `}
                        >
                            <div className="flex items-center justify-between gap-4">

                                {/* Left: Avatar & Info */}
                                <div className="flex items-center gap-4 min-w-0">
                                    {/* Avatar */}
                                    <div className={`
                    flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                    ${isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm'}
                  `}>
                                        {getInitials(customer.customer_name)}
                                    </div>

                                    {/* Text Details */}
                                    <div className="min-w-0">
                                        <p className={`text-base font-bold truncate ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                                            {customer.customer_name}
                                        </p>

                                        <div className="flex items-center gap-3 mt-0.5 text-sm">
                                            <div className="flex items-center text-slate-500">
                                                <Phone className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                                                <span className="truncate">{customer.customer_phone_number}</span>
                                            </div>

                                            {customer.customer_email && (
                                                <div className="hidden sm:flex items-center text-slate-500">
                                                    <span className="w-1 h-1 rounded-full bg-slate-300 mr-3" />
                                                    <Mail className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                                                    <span className="truncate max-w-[150px]">{customer.customer_email}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Actions */}
                                <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onSelectCustomer(customer) }}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="View details"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); onEditCustomer && onEditCustomer(customer) }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm transition-all"
                                        title="Edit customer"
                                    >
                                        <Edit3 className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">Edit</span>
                                    </button>
                                </div>

                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

export default CustomerList