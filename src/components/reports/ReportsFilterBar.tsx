import React from 'react'
import { Calendar, BarChart2, Filter } from 'lucide-react'
import type { ReportType } from '../../types/report'

interface ReportsFilterBarProps {
  reportType: ReportType
  startDate: string
  endDate: string
  limit: number
  onReportTypeChange: (value: ReportType) => void
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  onLimitChange: (value: number) => void
  onApply?: () => void
  onReset?: () => void
}

const ReportsFilterBar: React.FC<ReportsFilterBarProps> = ({
  reportType,
  startDate,
  endDate,
  limit,
  onReportTypeChange,
  onStartDateChange,
  onEndDateChange,
  onLimitChange,
  onApply,
  onReset,
}) => {
  return (
    <div className="bg-white shadow-sm rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {/* Report Type */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <BarChart2 className="h-5 w-5 text-gray-400" />
          </div>
          <select
            value={reportType}
            onChange={(e) => onReportTypeChange(e.target.value as ReportType)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
          >
            <option value="SALES_SUMMARY">Sales Summary</option>
            <option value="SALES_BY_CATEGORY">Sales by Service Category</option>
            <option value="REFUNDS_DETAIL">Refunds Report</option>
            <option value="TOP_SPENDING_CUSTOMERS">Top Spending Customers</option>
          </select>
        </div>

        {/* Start Date */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="date"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={startDate.substring(0, 10)}
            onChange={(e) => onStartDateChange(new Date(e.target.value).toISOString())}
          />
        </div>

        {/* End Date */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="date"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={endDate.substring(0, 10)}
            onChange={(e) => onEndDateChange(new Date(e.target.value + 'T23:59:59').toISOString())}
          />
        </div>

        {/* Limit (only for top customers) */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            disabled={reportType !== 'TOP_SPENDING_CUSTOMERS'}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 md:col-span-2">
          <button
            onClick={onReset}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={onApply}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReportsFilterBar
