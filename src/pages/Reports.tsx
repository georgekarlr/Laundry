import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ReportService } from '../services/reportService'
import type { ReportType, SalesSummaryRow, SalesByCategoryRow, RefundsDetailRow, TopSpendingCustomerRow } from '../types/report'
import ReportsFilterBar from '../components/reports/ReportsFilterBar'
import ReportsTable from '../components/reports/ReportsTable'
import ReportsChart from '../components/reports/ReportsChart'
import ExportButtons from '../components/reports/ExportButtons'
import { Receipt, BarChart3, Table as TableIcon, LineChart } from 'lucide-react'

const defaultDates = () => {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 30)
  return { start: start.toISOString(), end: end.toISOString() }
}

const Reports: React.FC = () => {
  const { start, end } = useMemo(defaultDates, [])
  const [reportType, setReportType] = useState<ReportType>('SALES_SUMMARY')
  const [startDate, setStartDate] = useState<string>(start)
  const [endDate, setEndDate] = useState<string>(end)
  const [limit, setLimit] = useState<number>(10)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<
      SalesSummaryRow | SalesByCategoryRow[] | RefundsDetailRow[] | TopSpendingCustomerRow[] | null
  >(null)

  const generate = useCallback(async () => {
    setError(null)
    // Validate dates
    if (!startDate || !endDate) {
      setError('Please select a valid start and end date')
      return
    }
    if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
      setError('End date cannot be earlier than start date')
      return
    }

    setLoading(true)
    try {
      if (reportType === 'SALES_SUMMARY') {
        const res = await ReportService.salesSummary(startDate, endDate)
        if (!res.success || !res.data) throw new Error(res.message)
        setData(res.data)
      } else if (reportType === 'SALES_BY_CATEGORY') {
        const res = await ReportService.salesByCategory(startDate, endDate)
        if (!res.success || !res.data) throw new Error(res.message)
        setData(res.data)
      } else if (reportType === 'REFUNDS_DETAIL') {
        const res = await ReportService.refundsDetail(startDate, endDate)
        if (!res.success || !res.data) throw new Error(res.message)
        setData(res.data)
      } else {
        const res = await ReportService.topSpendingCustomers(startDate, endDate, limit)
        if (!res.success || !res.data) throw new Error(res.message)
        setData(res.data)
      }
    } catch (e: any) {
      console.error('Report generate error:', e)
      setError(e?.message || 'Failed to generate report')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [reportType, startDate, endDate, limit])

  useEffect(() => {
    // Auto-generate on mount
    generate()
  }, [])

  // Clear stale data when switching report types to avoid shape mismatches
  useEffect(() => {
    setData(null)
    setError(null)
  }, [reportType])

  const fileBase = useMemo(() => {
    const a = startDate.substring(0,10).replace(/-/g, '')
    const b = endDate.substring(0,10).replace(/-/g, '')
    switch (reportType) {
      case 'SALES_SUMMARY': return `sales-summary_${a}-${b}`
      case 'SALES_BY_CATEGORY': return `sales-by-category_${a}-${b}`
      case 'REFUNDS_DETAIL': return `refunds_${a}-${b}`
      case 'TOP_SPENDING_CUSTOMERS': return `top-customers_${a}-${b}`
    }
  }, [reportType, startDate, endDate])

  return (
      <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500 pb-20">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 hidden sm:block">
                <Receipt className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Financial Reports</h2>
                <p className="mt-1 text-sm text-slate-500 font-medium">
                  Analyze performance metrics, sales trends, and customer insights.
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <ExportButtons filenameBase={fileBase} data={data as any} />
            </div>
          </div>

          {/* Filters Section */}
          <div className="relative z-10">
            <ReportsFilterBar
                reportType={reportType}
                startDate={startDate}
                endDate={endDate}
                limit={limit}
                onReportTypeChange={setReportType}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onLimitChange={setLimit}
                onApply={generate}
                onReset={() => {
                  const { start, end } = defaultDates()
                  setReportType('SALES_SUMMARY')
                  setStartDate(start)
                  setEndDate(end)
                  setLimit(10)
                  setError(null)
                  setData(null)
                }}
            />
          </div>

          {/* Analytics Grid */}
          <div className="space-y-8">

            {/* Chart Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Visual Analysis</h3>
              </div>
              <div className="p-6">
                <ReportsChart key={reportType + '-chart'} reportType={reportType} data={data as any} />
              </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <TableIcon className="h-4 w-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Detailed Data</h3>
              </div>
              <div className="p-0">
                <ReportsTable
                    key={reportType + '-table'}
                    reportType={reportType}
                    data={data as any}
                    loading={loading}
                    error={error}
                />
              </div>
            </div>

          </div>
        </div>
      </div>
  )
}

export default Reports