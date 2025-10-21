import React, { useEffect, useMemo, useState } from 'react'
import { X, Shirt, Calendar, User, Link as LinkIcon, AlertCircle, Loader2 } from 'lucide-react'
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

const GarmentDetailsModal: React.FC<GarmentDetailsModalProps> = ({ isOpen, garmentId, onClose, onUpdated }) => {
  const { persona } = useAuth()
  const personName = persona?.personName || persona?.loginName || 'Unknown'

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

  const orderIdShort = useMemo(() => details?.order_id ? `${details.order_id.substring(0, 8)}...` : '' , [details?.order_id])
  const createdDate = useMemo(() => details?.garment_created_at ? new Date(details.garment_created_at).toLocaleString() : '' , [details?.garment_created_at])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
            <div className="flex items-center space-x-3">
              <Shirt className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">Garment Details</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-600">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading details...
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          ) : details ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1">Garment Tag</div>
                  <div className="font-mono text-sm">{details.garment_tag_id || '—'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1">Status</div>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(details.garment_status)}`}>
                    {(details.garment_status || 'UNKNOWN').replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1 flex items-center"><Calendar className="h-4 w-4 mr-1" /> Created</div>
                  <div className="text-sm">{createdDate}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1 flex items-center"><User className="h-4 w-4 mr-1" /> Customer</div>
                  <div className="text-sm">{details.customer_name}</div>
                </div>
              </div>

              {/* Order link */}
              <div className="flex items-center justify-between bg-white border rounded-lg p-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Order</div>
                  <div className="text-sm font-mono">{orderIdShort}</div>
                </div>
                <Link to="/orders" className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm">
                  <LinkIcon className="h-4 w-4 mr-1" /> View Orders
                </Link>
              </div>

              {/* Description editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                />
                {descError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2 mt-2 text-sm text-red-700 flex items-center"><AlertCircle className="h-4 w-4 mr-1" /> {descError}</div>
                )}
                {descSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2 mt-2 text-sm text-green-700">{descSuccess}</div>
                )}
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleSaveDescription}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    disabled={savingDescription}
                  >
                    {savingDescription ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Description'}
                  </button>
                </div>
              </div>

              {/* Notes editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Type notes here (e.g., 'Small tear on collar', 'Extra starch')"
                />
                <p className="text-xs text-gray-500 mt-1">Saved as JSONB with a "text" field for compatibility.</p>
                {notesError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2 mt-2 text-sm text-red-700 flex items-center"><AlertCircle className="h-4 w-4 mr-1" /> {notesError}</div>
                )}
                {notesSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2 mt-2 text-sm text-green-700">{notesSuccess}</div>
                )}
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleSaveNotes}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    disabled={savingNotes}
                  >
                    {savingNotes ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Notes'}
                  </button>
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
