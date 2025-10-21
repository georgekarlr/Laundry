import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ReportService } from '../services/reportService'
import type { ReportType, SalesSummaryRow, SalesByCategoryRow, RefundsDetailRow, TopSpendingCustomerRow } from '../types/report'
import ReportsFilterBar from '../components/reports/ReportsFilterBar'
import ReportsTable from '../components/reports/ReportsTable'
import ReportsChart from '../components/reports/ReportsChart'
import ExportButtons from '../components/reports/ExportButtons'
import { Receipt } from 'lucide-react'

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
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Receipt className="h-5 w-5 text-blue-700" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Financial Reports</h2>
            <p className="text-sm text-gray-600">Generate tables and charts for a selected date range.</p>
          </div>
        </div>
        <ExportButtons filenameBase={fileBase} data={data as any} />
      </div>

      {/* Filters */}
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

      {/* Chart */}
      <ReportsChart key={reportType + '-chart'} reportType={reportType} data={data as any} />

      {/* Table */}
      <ReportsTable key={reportType + '-table'} reportType={reportType} data={data as any} loading={loading} error={error} />
    </div>
  )
}

export default Reports
