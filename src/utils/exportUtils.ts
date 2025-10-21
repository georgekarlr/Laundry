export interface ExportColumn<T = any> {
  key: keyof T | string
  label: string
  format?: (value: any, row: T) => string
}

function escapeCsvValue(val: any): string {
  if (val === null || val === undefined) return ''
  const str = String(val)
  // Escape quotes by doubling them
  const escaped = str.replace(/"/g, '""')
  // Quote if contains comma, quote, or newline
  if (/[",\n\r]/.test(escaped)) {
    return `"${escaped}"`
  }
  return escaped
}

export function rowsToCsv<T>(rows: T[], columns: ExportColumn<T>[]): string {
  const header = columns.map(c => escapeCsvValue(c.label)).join(',')
  const body = rows.map(row => {
    return columns.map(col => {
      const raw = (row as any)[col.key as string]
      const val = col.format ? col.format(raw, row) : raw
      return escapeCsvValue(val)
    }).join(',')
  }).join('\n')
  // Add BOM for Excel UTF-8 support
  return `\uFEFF${header}\n${body}`
}

export function downloadCsv<T>(rows: T[], columns: ExportColumn<T>[], filenameBase: string): void {
  const csv = rowsToCsv(rows, columns)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  a.href = url
  a.download = `${filenameBase}-${yyyy}-${mm}-${dd}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function openPrintAsPdf<T>(rows: T[], columns: ExportColumn<T>[], title: string, subtitle?: string): void {
  const styles = `
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; padding: 24px; color: #111827; }
      h1 { font-size: 20px; margin: 0 0 4px 0; }
      p { margin: 0 0 16px 0; color: #6B7280; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #E5E7EB; padding: 8px; font-size: 12px; text-align: left; }
      th { background: #F9FAFB; color: #374151; text-transform: uppercase; font-weight: 600; }
      tfoot td { font-weight: 600; }
      .meta { margin: 8px 0 16px; font-size: 12px; color: #6B7280; }
    </style>
  `
  const thead = `<tr>${columns.map(c => `<th>${c.label}</th>`).join('')}</tr>`
  const tbody = rows.map((row) => {
    const tds = columns.map(col => {
      const raw = (row as any)[col.key as string]
      const val = col.format ? col.format(raw, row) : (raw ?? '')
      const safe = String(val)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      return `<td>${safe}</td>`
    }).join('')
    return `<tr>${tds}</tr>`
  }).join('')

  const now = new Date()
  const printedAt = now.toLocaleString()
  const doc = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        ${styles}
      </head>
      <body>
        <h1>${title}</h1>
        ${subtitle ? `<p>${subtitle}</p>` : ''}
        <div class="meta">Printed at: ${printedAt}</div>
        <table>
          <thead>${thead}</thead>
          <tbody>${tbody}</tbody>
        </table>
        <script>
          window.onload = function(){
            setTimeout(function(){ window.print(); }, 50);
          };
        <\/script>
      </body>
    </html>
  `
  const win = window.open('', '_blank')
  if (!win) return
  win.document.open()
  win.document.write(doc)
  win.document.close()
}
