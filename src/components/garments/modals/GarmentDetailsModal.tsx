import React, { useEffect, useMemo, useState } from 'react'
import { X, Shirt, Calendar, User, Link as LinkIcon, AlertCircle, Loader2, Tag, FileText, Check, Edit3, ExternalLink } from 'lucide-react'
import { GarmentService } from '../../../services/garmentService'
import type { GarmentDetails } from '../../../types/garment'
import { useAuth } from '../../../contexts/AuthContext'
import { Link } from 'react-router-dom'

interface GarmentDetailsModalProps {
  isOpen: boolean
  garmentId: string | null
  onClose: () => void
  onUpdated?: () => void
}

const statusColor = (status?: string | null) => {
  const base = "px-2.5 py-0.5 rounded-full text-xs font-bold border "
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
      return `${base} bg-slate-50 text-slate-600 border-slate-200`
  }
}

const GarmentDetailsModal: React.FC<GarmentDetailsModalProps> = ({ isOpen, garmentId, onClose, onUpdated }) => {
  const { persona } = useAuth()
  const personName = persona?.personName || persona?.loginName || 'Admin'

  const [details, setDetails] = useState<GarmentDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [notesText, setNotesText] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [notesError, setNotesError] = useState('')
  const [notesSuccess, setNotesSuccess] = useState('')

  const [description, setDescription] = useState('')
  const [savingDescription, setSavingDescription] = useState(false)
  const [descError, setDescError] = useState('')
  const [descSuccess, setDescSuccess] = useState('')

  useEffect(() => {
    const run = async () => {
      if (!isOpen || !garmentId) return
      setLoading(true)
      setError('')
      setDetails(null)
      setNotesSuccess('')
      setDescSuccess('')
      try {
        const res = await GarmentService.getGarmentDetails(garmentId)
        if (!res.success || !res.data) {
          setError(res.message)
        } else {
          setDetails(res.data)
          // prepare editable fields
          const n = res.data.garment_notes
          if (typeof n === 'string') setNotesText(n)
          else if (n && typeof n === 'object' && 'text' in n) setNotesText((n as any).text ?? '')
          else if (n) setNotesText(JSON.stringify(n, null, 2))
          else setNotesText('')

          setDescription(res.data.garment_description || '')
        }
      } catch (e) {
        setError('Failed to load garment details')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [isOpen, garmentId])

  const handleSaveNotes = async () => {
    if (!garmentId) return
    setSavingNotes(true)
    setNotesError('')
    setNotesSuccess('')
    try {
      // Convert to simple JSONB payload with text field
      const payload = { text: notesText }
      const res = await GarmentService.updateGarmentNotes(garmentId, payload, personName)
      if (!res.success || !res.data) {
        setNotesError(res.message)
        return
      }
      setNotesSuccess('Notes saved')
      // Update local details
      setDetails(prev => prev ? { ...prev, garment_notes: res.data.garment_notes } : prev)
      onUpdated?.()
    } catch (e) {
      setNotesError('Failed to save notes')
    } finally {
      setSavingNotes(false)
    }
  }

  const handleSaveDescription = async () => {
    if (!garmentId) return
    setSavingDescription(true)
    setDescError('')
    setDescSuccess('')
    try {
      const res = await GarmentService.updateGarmentDetails(garmentId, personName, description || null)
      if (!res.success || !res.data) {
        setDescError(res.message)
        return
      }
      setDescSuccess('Description saved')
      setDetails(prev => prev ? { ...prev, garment_description: res.data.garment_description } : prev)
      onUpdated?.()
    } catch (e) {
      setDescError('Failed to save description')
    } finally {
      setSavingDescription(false)
    }
  }

  const orderIdShort = useMemo(() => details?.order_id ? `${details.order_id.substring(0, 8)}` : '' , [details?.order_id])
  const createdDate = useMemo(() => details?.garment_created_at ? new Date(details.garment_created_at).toLocaleString() : '' , [details?.garment_created_at])

  if (!isOpen) return null

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <div
            className="absolute inset-0 bg-slate-900/75 backdrop-blur-sm transition-opacity"
            onClick={onClose}
        />

        {/* Modal Container */}
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 fade-in duration-200">

          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10 sticky top-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Shirt className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-none">Garment Details</h3>
                <p className="text-xs text-slate-500 mt-1">View and edit garment information</p>
              </div>
            </div>
            <button
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto p-6">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                  <span className="font-medium">Retrieving details...</span>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
            ) : details ? (
                <div className="space-y-8">

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Tag */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <Tag className="h-3.5 w-3.5" /> Garment Tag
                      </div>
                      <div className="font-mono text-base font-bold text-slate-900">
                        {details.garment_tag_id || '—'}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <Loader2 className="h-3.5 w-3.5" /> Current Status
                      </div>
                      <div>
                    <span className={statusColor(details.garment_status)}>
                      {(details.garment_status || 'UNKNOWN').replace(/_/g, ' ')}
                    </span>
                      </div>
                    </div>

                    {/* Created Date */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <Calendar className="h-3.5 w-3.5" /> Intake Date
                      </div>
                      <div className="text-sm font-medium text-slate-900">{createdDate}</div>
                    </div>

                    {/* Customer */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <User className="h-3.5 w-3.5" /> Customer
                      </div>
                      <div className="text-sm font-bold text-slate-900 truncate">{details.customer_name}</div>
                    </div>
                  </div>

                  {/* Order Context Bar */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between group hover:border-indigo-300 transition-colors">
                    <div>
                      <div className="text-xs text-slate-500 font-medium mb-0.5">Associated Order</div>
                      <div className="text-sm font-mono font-bold text-slate-900">#{orderIdShort}</div>
                    </div>
                    <Link
                        to="/orders"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                    >
                      <LinkIcon className="h-3.5 w-3.5" />
                      View Order
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-6 space-y-6">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Update Information</h4>

                    {/* Description Editor */}
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-slate-700">Description</label>
                      <div className="relative group">
                        <Edit3 className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <textarea
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none text-sm text-slate-900"
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. Blue silk shirt, delicate cycle"
                        />
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center justify-between min-h-[32px]">
                        <div className="flex-1">
                          {descError && (
                              <span className="text-xs text-red-600 flex items-center gap-1 font-medium animate-in slide-in-from-left-2">
                          <AlertCircle className="h-3 w-3" /> {descError}
                        </span>
                          )}
                          {descSuccess && (
                              <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium animate-in slide-in-from-left-2">
                          <Check className="h-3 w-3" /> {descSuccess}
                        </span>
                          )}
                        </div>
                        <button
                            onClick={handleSaveDescription}
                            className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-indigo-200"
                            disabled={savingDescription}
                        >
                          {savingDescription ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : 'Save Description'}
                        </button>
                      </div>
                    </div>

                    {/* Notes Editor */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-baseline">
                        <label className="block text-sm font-bold text-slate-700">Condition Notes</label>
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-mono">JSONB Compatible</span>
                      </div>
                      <div className="relative group">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <textarea
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm text-slate-900"
                            rows={4}
                            value={notesText}
                            onChange={(e) => setNotesText(e.target.value)}
                            placeholder="e.g. Stain on collar, missing button..."
                        />
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center justify-between min-h-[32px]">
                        <div className="flex-1">
                          {notesError && (
                              <span className="text-xs text-red-600 flex items-center gap-1 font-medium animate-in slide-in-from-left-2">
                          <AlertCircle className="h-3 w-3" /> {notesError}
                        </span>
                          )}
                          {notesSuccess && (
                              <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium animate-in slide-in-from-left-2">
                          <Check className="h-3 w-3" /> {notesSuccess}
                        </span>
                          )}
                        </div>
                        <button
                            onClick={handleSaveNotes}
                            className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-emerald-200"
                            disabled={savingNotes}
                        >
                          {savingNotes ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : 'Save Notes'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
            ) : null}
          </div>
        </div>
      </div>
  )
}

export default GarmentDetailsModal