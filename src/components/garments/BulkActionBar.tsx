import React, { useState } from 'react'
import { X, Check, ChevronDown, Layers, Loader2, ArrowRight } from 'lucide-react'

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
      <div className="fixed bottom-6 left-4 right-4 z-50 flex justify-center animate-in slide-in-from-bottom-10 fade-in duration-300">
        <div className="bg-slate-900 text-white shadow-2xl shadow-slate-900/40 rounded-2xl p-3 pl-5 pr-3 w-full max-w-3xl border border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xl">

          {/* Left: Selection Counter */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500/20 text-indigo-300 p-2 rounded-lg">
                <Layers className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bulk Action</span>
                <span className="font-semibold text-sm">
                <span className="text-white">{selectedCount}</span> Item{selectedCount !== 1 ? 's' : ''} Selected
              </span>
              </div>
            </div>

            {/* Mobile Clear Button (Visible only on small screens) */}
            <button
                onClick={onClearSelection}
                className="sm:hidden p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Status Selector */}
            <div className="relative flex-1 sm:flex-none group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Check className="h-4 w-4 text-emerald-400" />
              </div>
              <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full sm:w-48 pl-9 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none cursor-pointer hover:bg-slate-750 transition-colors"
              >
                {garmentStatuses.map(s => (
                    <option key={s} value={s} className="bg-slate-900">
                      Set to {s.replace(/_/g, ' ')}
                    </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none group-hover:text-white transition-colors" />
            </div>

            {/* Apply Button */}
            <button
                onClick={handleApply}
                disabled={!canApply}
                className={`
              flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all
              ${loading
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 hover:scale-105 active:scale-95'
                }
            `}
            >
              {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
              ) : (
                  <>
                    <span>Update</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
              )}
            </button>

            {/* Desktop Clear Button */}
            <button
                onClick={onClearSelection}
                className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
                title="Clear Selection"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
  )
}

export default BulkActionBar