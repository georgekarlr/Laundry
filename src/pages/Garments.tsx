import React, { useEffect, useState } from 'react'
import GarmentsFilterBar from '../components/garments/GarmentsFilterBar'
import GarmentsTable from '../components/garments/GarmentsTable'
import BulkActionBar from '../components/garments/BulkActionBar'
import GarmentDetailsModal from '../components/garments/modals/GarmentDetailsModal'
import { GarmentService } from '../services/garmentService'
import type { GarmentListItem } from '../types/garment'
import { AlertCircle } from 'lucide-react'

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
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Garments</h1>
        <p className="mt-1 text-sm text-gray-600">Find garments with filters and update statuses in bulk.</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

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

      <GarmentsTable
        garments={garments}
        loading={loading}
        error={error}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onView={handleViewGarment}
      />

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Showing up to {limit} items</div>
        <div className="space-x-2">
          <button
            className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0 || loading}
          >
            Previous
          </button>
          <button
            className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            onClick={() => setOffset(offset + limit)}
            disabled={loading || garments.length < limit}
          >
            Next
          </button>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <BulkActionBar
          selectedCount={selectedIds.size}
          onApply={handleBulkUpdate}
          onClearSelection={clearSelection}
        />
      )}

      <GarmentDetailsModal
        isOpen={!!viewGarmentId}
        garmentId={viewGarmentId}
        onClose={() => setViewGarmentId(null)}
        onUpdated={loadGarments}
      />
    </div>
  )
}

export default Garments
