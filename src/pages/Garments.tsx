import React, { useEffect, useState } from 'react'
import GarmentsFilterBar from '../components/garments/GarmentsFilterBar'
import GarmentsTable from '../components/garments/GarmentsTable'
import BulkActionBar from '../components/garments/BulkActionBar'
import GarmentDetailsModal from '../components/garments/modals/GarmentDetailsModal'
import { GarmentService } from '../services/garmentService'
import type { GarmentListItem } from '../types/garment'
import { AlertCircle, Shirt, ChevronLeft, ChevronRight, Layers } from 'lucide-react'

const Garments: React.FC = () => {
  const [garments, setGarments] = useState<GarmentListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState('ALL')
  const [orderId, setOrderId] = useState('')

  // Pagination
  const [limit, setLimit] = useState(20)
  const [offset, setOffset] = useState(0)

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // View modal state
  const [viewGarmentId, setViewGarmentId] = useState<string | null>(null)

  const loadGarments = async () => {
    setLoading(true)
    setError('')

    const result = await GarmentService.findGarments({
      searchTerm: searchTerm.trim() || null,
      status: status === 'ALL' ? null : status,
      orderId: orderId.trim() || null,
      limit,
      offset,
    })

    if (result.success && result.data) {
      setGarments(result.data)
    } else {
      setError(result.message)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadGarments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, offset])

  const handleApplyFilters = () => {
    setOffset(0)
    loadGarments()
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setStatus('ALL')
    setOrderId('')
    setLimit(20)
    setOffset(0)
    loadGarments()
  }

  const handleViewGarment = (id: string) => {
    setViewGarmentId(id)
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    setSelectedIds(prev => {
      if (garments.length === 0) return new Set()
      const allSelected = garments.every(g => prev.has(g.garment_id))
      return allSelected ? new Set() : new Set(garments.map(g => g.garment_id))
    })
  }

  const clearSelection = () => setSelectedIds(new Set())

  const handleBulkUpdate = async (newStatus: string) => {
    if (selectedIds.size === 0) return
    const ids = Array.from(selectedIds)
    const result = await GarmentService.updateGarmentStatusBulk(ids, newStatus)
    if (!result.success) {
      setError(result.message)
      return
    }
    clearSelection()
    await loadGarments()
  }

  return (
      <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500 pb-24">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 hidden sm:block">
                <Shirt className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Garment Inventory</h1>
                <p className="mt-1 text-sm text-slate-500 font-medium">
                  Track status, filter by order, and manage bulk updates.
                </p>
              </div>
            </div>
            {/* Optional: Add a 'Total' badge here if data available, keeping plain for now based on logic */}
          </div>

          {/* Error Message */}
          {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3 shadow-sm">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
          )}

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

            {/* Filters Section */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <Layers className="h-3 w-3" /> Filters & Search
              </div>
              <GarmentsFilterBar
                  searchTerm={searchTerm}
                  status={status}
                  orderId={orderId}
                  limit={limit}
                  onSearchTermChange={setSearchTerm}
                  onStatusChange={setStatus}
                  onOrderIdChange={setOrderId}
                  onLimitChange={setLimit}
                  onApply={handleApplyFilters}
                  onReset={handleResetFilters}
              />
            </div>

            {/* Table Section */}
            <div className="relative min-h-[400px]">
              <GarmentsTable
                  garments={garments}
                  loading={loading}
                  error={error}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelect}
                  onToggleSelectAll={toggleSelectAll}
                  onView={handleViewGarment}
              />
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
              <div className="text-sm font-medium text-slate-500">
                Showing <span className="text-slate-900 font-bold">{limit}</span> items per page
              </div>
              <div className="flex items-center space-x-2">
                <button
                    className="flex items-center px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-white hover:border-slate-300 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-transparent transition-all shadow-sm"
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                    disabled={offset === 0 || loading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>
                <button
                    className="flex items-center px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-white hover:border-slate-300 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-transparent transition-all shadow-sm"
                    onClick={() => setOffset(offset + limit)}
                    disabled={loading || garments.length < limit}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>

          {/* Sticky Bulk Action Bar */}
          {selectedIds.size > 0 && (
              <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4 animate-in slide-in-from-bottom-6 duration-300">
                <div className="bg-slate-900 text-white p-2 rounded-2xl shadow-2xl border border-slate-700 max-w-4xl w-full mx-auto">
                  <BulkActionBar
                      selectedCount={selectedIds.size}
                      onApply={handleBulkUpdate}
                      onClearSelection={clearSelection}
                  />
                </div>
              </div>
          )}

          <GarmentDetailsModal
              isOpen={!!viewGarmentId}
              garmentId={viewGarmentId}
              onClose={() => setViewGarmentId(null)}
              onUpdated={loadGarments}
          />
        </div>
      </div>
  )
}

export default Garments