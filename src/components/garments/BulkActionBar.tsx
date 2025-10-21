import React, { useState } from 'react'

interface BulkActionBarProps {
  selectedCount: number
  onApply: (newStatus: string) => Promise<void> | void
  onClearSelection: () => void
}

const garmentStatuses = [
  'PENDING',
  'IN_WASH',
  'IN_PRESSING',
  'READY',
]

const BulkActionBar: React.FC<BulkActionBarProps> = ({ selectedCount, onApply, onClearSelection }) => {
  const [status, setStatus] = useState('PENDING')
  const [loading, setLoading] = useState(false)
  const canApply = selectedCount > 0 && !loading

  const handleApply = async () => {
    if (!canApply) return
    setLoading(true)
    try {
      await onApply(status)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 left-6 right-6 z-40">
      <div className="max-w-5xl mx-auto bg-white shadow-lg border border-gray-200 rounded-lg p-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          <span className="font-medium">{selectedCount}</span> item{selectedCount !== 1 ? 's' : ''} selected
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {garmentStatuses.map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <button
            onClick={handleApply}
            disabled={!canApply}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Status'}
          </button>
          <button
            onClick={onClearSelection}
            className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}

export default BulkActionBar
