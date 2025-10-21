import React, { useEffect, useRef, useState } from 'react'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { downloadCsv, ExportColumn, openPrintAsPdf } from '../../utils/exportUtils'

interface ExportMenuProps<T = any> {
  rows: T[]
  columns: ExportColumn<T>[]
  filenameBase: string
  title?: string
  subtitle?: string
  disabled?: boolean
  className?: string
  onAfterExport?: (type: 'csv' | 'pdf') => void
}

function useOnClickOutside(ref: React.RefObject<HTMLElement>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      const el = ref.current
      if (!el || el.contains(event.target as Node)) return
      handler()
    }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [ref, handler])
}

function ExportMenu<T>({ rows, columns, filenameBase, title = 'Export', subtitle, disabled, className, onAfterExport }: ExportMenuProps<T>) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(menuRef, () => setOpen(false))

  const hasRows = rows && rows.length > 0
  const isDisabled = disabled || !hasRows

  const handleCsv = () => {
    if (isDisabled) return
    downloadCsv(rows, columns, filenameBase)
    setOpen(false)
    onAfterExport?.('csv')
  }

  const handlePdf = () => {
    if (isDisabled) return
    const docTitle = title || 'Export'
    openPrintAsPdf(rows, columns, docTitle, subtitle)
    setOpen(false)
    onAfterExport?.('pdf')
  }

  return (
    <div className={`relative ${className || ''}`} ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        disabled={isDisabled}
        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        <Download className="h-4 w-4 mr-2" />
        Export
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
          <button
            onClick={handleCsv}
            className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
            Export to CSV
          </button>
          <button
            onClick={handlePdf}
            className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <FileText className="h-4 w-4 mr-2 text-blue-600" />
            Export to PDF
          </button>
        </div>
      )}
    </div>
  )
}

export default ExportMenu
