import React from 'react'
import { Download, FileText } from 'lucide-react'

interface ExportButtonsProps<T> {
  filenameBase: string
  data: T | T[] | null
}

function toCsv<T extends Record<string, any>>(rows: T[]): string {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const escape = (val: any) => {
    if (val === null || val === undefined) return ''
    const s = String(val)
    if (s.includes(',') || s.includes('\n') || s.includes('"')) {
      return '"' + s.replace(/"/g, '""') + '"'
    }
    return s
  }
  const lines = [headers.join(',')]
  for (const row of rows) {
    lines.push(headers.map(h => escape(row[h])).join(','))
  }
  return lines.join('\n')
}

function download(content: Blob, filename: string) {
  const url = URL.createObjectURL(content)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

const ExportButtons = <T extends Record<string, any>>({ filenameBase, data }: ExportButtonsProps<T>) => {
  const onExportCsv = () => {
    if (!data) return
    const rows = Array.isArray(data) ? data : [data]
    const csv = toCsv(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    download(blob, `${filenameBase}.csv`)
  }

  const onExportPdf = () => {
    // Minimal, dependency-free: open print dialog so user can save as PDF
    window.print()
  }

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={onExportCsv}
        className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
        title="Export CSV"
      >
        <Download className="h-4 w-4" />
        <span>CSV</span>
      </button>
      <button
        onClick={onExportPdf}
        className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
        title="Export PDF"
      >
        <FileText className="h-4 w-4" />
        <span>PDF</span>
      </button>
    </div>
  )
}

export default ExportButtons
