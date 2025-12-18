import React from 'react'
import type { GarmentListItem } from '../../types/garment'
import { User, Calendar, Eye, Tag, AlertCircle, Search, ChevronRight } from 'lucide-react'

interface GarmentsTableProps {
  garments: GarmentListItem[]
  loading: boolean
  error: string
  selectedIds: Set<string>
  onToggleSelect: (garmentId: string) => void
  onToggleSelectAll: () => void
  onView: (garmentId: string) => void
}

const getStatusStyles = (status?: string | null) => {
  const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
  switch (status) {
    case 'READY':
      return `${base} bg-emerald-50 text-emerald-700 border-emerald-200`
    case 'IN_PRESSING':
      return `${base} bg-amber-50 text-amber-700 border-amber-200`
    case 'IN_WASH':
      return `${base} bg-blue-50 text-blue-700 border-blue-200`
    case 'PENDING':
      return `${base} bg-slate-50 text-slate-600 border-slate-200`
    default:
      return `${base} bg-gray-50 text-gray-600 border-gray-200`
  }
}

const GarmentsTable: React.FC<GarmentsTableProps> = ({
                                                       garments,
                                                       loading,
                                                       error,
                                                       selectedIds,
                                                       onToggleSelect,
                                                       onToggleSelectAll,
                                                       onView,
                                                     }) => {

  // 1. Adaptive Skeleton Loader
  if (loading) {
    return (
        <div className="w-full">
          {/* Mobile Skeleton */}
          <div className="md:hidden space-y-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm animate-pulse">
                  <div className="flex justify-between mb-4">
                    <div className="h-4 w-20 bg-slate-200 rounded" />
                    <div className="h-4 w-4 bg-slate-200 rounded" />
                  </div>
                  <div className="h-6 w-3/4 bg-slate-200 rounded mb-4" />
                  <div className="h-10 w-full bg-slate-100 rounded" />
                </div>
            ))}
          </div>

          {/* Desktop Skeleton */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100">
              <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-200">
                <div className="flex gap-4">
                  <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                </div>
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between animate-pulse">
                    <div className="h-4 w-full bg-slate-100 rounded" />
                  </div>
              ))}
            </div>
          </div>
        </div>
    )
  }

  // 2. Error State
  if (error) {
    return (
        <div className="bg-white rounded-2xl border border-red-100 p-12 text-center shadow-sm">
          <div className="mx-auto h-12 w-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Unable to load inventory</h3>
          <p className="text-red-600 mt-1 max-w-sm mx-auto">{error}</p>
        </div>
    )
  }

  // 3. Empty State
  if (garments.length === 0) {
    return (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="mx-auto h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No garments found</h3>
          <p className="text-slate-500 mt-1">Try adjusting your filters or search terms.</p>
        </div>
    )
  }

  const allSelected = garments.length > 0 && garments.every(g => selectedIds.has(g.garment_id))

  return (
      <div className="w-full">

        {/* --- MOBILE VIEW (Cards) --- */}
        <div className="md:hidden space-y-4">
          {/* Mobile Bulk Select Header */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-3 shadow-sm">
            <input
                type="checkbox"
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-5 w-5"
                checked={allSelected}
                onChange={onToggleSelectAll}
            />
            <span className="text-sm font-bold text-slate-700">Select All Garments</span>
          </div>

          {garments.map((g) => {
            const isSelected = selectedIds.has(g.garment_id)
            return (
                <div
                    key={g.garment_id}
                    className={`
                relative bg-white rounded-2xl border shadow-sm p-4 transition-all
                ${isSelected ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/10' : 'border-slate-200'}
              `}
                >
                  {/* Header: Checkbox + Tag + Status */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <input
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-5 w-5"
                          checked={isSelected}
                          onChange={() => onToggleSelect(g.garment_id)}
                      />
                      <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                        <Tag className="h-3 w-3 text-slate-400" />
                        <span className="font-mono text-xs font-bold text-slate-700">{g.garment_tag_id || '—'}</span>
                      </div>
                    </div>
                    <span className={getStatusStyles(g.garment_status)}>
                  {(g.garment_status || 'UNKNOWN').replace(/_/g, ' ')}
                </span>
                  </div>

                  {/* Body: Description */}
                  <div className="mb-4 pl-8" onClick={() => onView(g.garment_id)}>
                    <h4 className="font-bold text-slate-900 text-lg leading-tight mb-1">{g.garment_description}</h4>
                    <div className="flex items-center text-xs text-slate-500 gap-2">
                      <Calendar className="h-3 w-3" />
                      {new Date(g.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Footer: Customer Card */}
                  <div
                      onClick={() => onView(g.garment_id)}
                      className="bg-slate-50 rounded-xl p-3 flex items-center justify-between active:bg-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                        <User className="h-4 w-4 text-slate-400" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-700">{g.customer_name}</div>
                        <div className="text-[10px] font-mono text-slate-400 uppercase">Order #{g.order_id.substring(0, 8)}</div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300" />
                  </div>
                </div>
            )
          })}
        </div>


        {/* --- DESKTOP VIEW (Table) --- */}
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 w-[1%]">
                  <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer transition-all"
                      checked={allSelected}
                      onChange={onToggleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Tag ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Customer & Order
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Intake Date
                </th>
              </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
              {garments.map((g) => {
                const isSelected = selectedIds.has(g.garment_id)
                return (
                    <tr
                        key={g.garment_id}
                        className={`
                      group transition-colors duration-150
                      ${isSelected ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}
                    `}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                            type="checkbox"
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                            checked={isSelected}
                            onChange={() => onToggleSelect(g.garment_id)}
                        />
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Tag className="h-3 w-3 text-slate-400" />
                          <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                          {g.garment_tag_id || '—'}
                        </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <button
                            onClick={() => onView(g.garment_id)}
                            className="group/link flex items-center text-left"
                        >
                        <span className="text-sm font-medium text-slate-900 group-hover/link:text-indigo-600 transition-colors">
                          {g.garment_description || 'No Description'}
                        </span>
                          <Eye className="h-3 w-3 ml-2 text-slate-300 opacity-0 group-hover/link:opacity-100 group-hover/link:text-indigo-400 transition-all transform translate-x-1" />
                        </button>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusStyles(g.garment_status)}>
                        <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                            g.garment_status === 'READY' ? 'bg-emerald-500' :
                                g.garment_status === 'IN_WASH' ? 'bg-blue-500' :
                                    g.garment_status === 'IN_PRESSING' ? 'bg-amber-500' : 'bg-slate-400'
                        }`} />
                        {(g.garment_status || 'UNKNOWN').replace(/_/g, ' ')}
                      </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                            <User className="h-4 w-4 text-slate-500" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-700 leading-none mb-1">
                              {g.customer_name}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wide">
                              Order #{g.order_id.substring(0, 8)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {new Date(g.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                    </tr>
                )
              })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  )
}

export default GarmentsTable