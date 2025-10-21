import React from 'react'
import type { GarmentListItem } from '../../types/garment'
import { Package, User, Calendar, Eye } from 'lucide-react'

interface GarmentsTableProps {
  garments: GarmentListItem[]
  loading: boolean
  error: string
  selectedIds: Set<string>
  onToggleSelect: (garmentId: string) => void
  onToggleSelectAll: () => void
  onView: (garmentId: string) => void
}

const statusColor = (status?: string | null) => {
  switch (status) {
    case 'READY':
      return 'bg-green-100 text-green-800'
    case 'IN_PRESSING':
      return 'bg-yellow-100 text-yellow-800'
    case 'IN_WASH':
      return 'bg-blue-100 text-blue-800'
    case 'PENDING':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
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
  if (loading) {
    return (
      <div className="bg-white shadow-sm rounded-lg">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading garments...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6 text-center">
        <Package className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (garments.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6 text-center">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No garments found.</p>
        <p className="text-sm text-gray-500 mt-1">Try adjusting your search criteria.</p>
      </div>
    )
  }

  const allSelected = garments.length > 0 && garments.every(g => selectedIds.has(g.garment_id))

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Garment Tag
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order / Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {garments.map((g) => (
              <tr key={g.garment_id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(g.garment_id)}
                    onChange={() => onToggleSelect(g.garment_id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                  {g.garment_tag_id || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => onView(g.garment_id)}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                    title="View garment details"
                  >
                    {g.garment_description || '—'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(g.garment_status)}`}>
                    {(g.garment_status || 'UNKNOWN').replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{g.customer_name}</div>
                      <div className="text-xs text-gray-500 font-mono">{g.order_id.substring(0, 8)}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(g.created_at).toLocaleDateString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default GarmentsTable
