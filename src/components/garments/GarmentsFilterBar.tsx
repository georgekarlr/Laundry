import React from 'react'
import { Search, Filter, Hash, RotateCcw, ChevronDown, ListFilter, ArrowRight } from 'lucide-react'

interface GarmentsFilterBarProps {
  searchTerm: string
  status: string
  orderId: string
  limit: number
  onSearchTermChange: (value: string) => void
  onStatusChange: (value: string) => void
  onOrderIdChange: (value: string) => void
  onLimitChange: (value: number) => void
  onApply?: () => void
  onReset?: () => void
}

const GarmentsFilterBar: React.FC<GarmentsFilterBarProps> = ({
                                                               searchTerm,
                                                               status,
                                                               orderId,
                                                               limit,
                                                               onSearchTermChange,
                                                               onStatusChange,
                                                               onOrderIdChange,
                                                               onLimitChange,
                                                               onApply,
                                                               onReset,
                                                             }) => {
  return (
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">

          {/* Search (Spans 4 columns on large screens) */}
          <div className="lg:col-span-4 relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
                type="text"
                placeholder="Search by tag, description..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
            />
          </div>

          {/* Status Filter (Spans 2 columns) */}
          <div className="lg:col-span-2 relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <ListFilter className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <select
                value={status}
                onChange={(e) => onStatusChange(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none cursor-pointer text-slate-600 font-medium"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="IN_WASH">In Wash</option>
              <option value="IN_PRESSING">In Pressing</option>
              <option value="READY">Ready</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Order ID (Spans 2 columns) */}
          <div className="lg:col-span-2 relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Hash className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
                type="text"
                placeholder="Order UUID..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-mono placeholder:font-sans"
                value={orderId}
                onChange={(e) => onOrderIdChange(e.target.value)}
            />
          </div>

          {/* Limit (Spans 2 columns) */}
          <div className="lg:col-span-2 relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <select
                value={limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none cursor-pointer text-slate-600 font-medium"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Actions (Spans 2 columns) */}
          <div className="lg:col-span-2 flex gap-2">
            <button
                onClick={onReset}
                className="px-3 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
                title="Reset Filters"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
                onClick={onApply}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 hover:-translate-y-0.5 transition-all"
            >
              <span>Filter</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      </div>
  )
}

export default GarmentsFilterBar