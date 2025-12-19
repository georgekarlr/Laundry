import React from 'react'
import { AlertTriangle, X, Trash2, Loader2 } from 'lucide-react'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  itemName: string
  loading: boolean
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
                                                                           isOpen,
                                                                           onClose,
                                                                           onConfirm,
                                                                           itemName,
                                                                           loading,
                                                                         }) => {
  if (!isOpen) return null

  return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
        />

        {/* Modal Container */}
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">

          {/* Close Button (Absolute) */}
          <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors z-10"
              aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-6 sm:p-8 text-center">
            {/* Warning Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 border-4 border-red-100 mb-6">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Confirm Deletion
            </h3>

            {/* Description */}
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Are you sure you want to permanently remove this service? This action cannot be undone.
            </p>

            {/* Item Highlight */}
            <div className="bg-red-50/50 border border-red-100 rounded-xl p-3 mb-8">
              <p className="text-xs font-bold text-red-500 uppercase tracking-wide mb-1">Target Item</p>
              <p className="text-base font-bold text-slate-900 break-words">
                "{itemName}"
              </p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  disabled={loading}
              >
                Cancel
              </button>
              <button
                  type="button"
                  onClick={onConfirm}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-200 hover:shadow-red-500/30 hover:-translate-y-0.5"
                  disabled={loading}
              >
                {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                ) : (
                    <>
                      <Trash2 className="h-5 w-5" />
                      <span>Delete Service</span>
                    </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
  )
}

export default DeleteConfirmationModal