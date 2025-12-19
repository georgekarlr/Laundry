import React from 'react'
import { Calendar, Filter, ChevronDown, RotateCcw, ArrowRight, PieChart, Sliders } from 'lucide-react'
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
      <div className="bg-white shadow-sm rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <Sliders className="h-3 w-3" /> Report Configuration
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

          {/* Report Type (Spans 4 columns) */}
          <div className="md:col-span-4 relative group">
            <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-indigo-500">
              Report Type
            </label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <PieChart className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <select
                value={reportType}
                onChange={(e) => onReportTypeChange(e.target.value as ReportType)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none cursor-pointer transition-all"
            >
              <option value="SALES_SUMMARY">Sales Summary</option>
              <option value="SALES_BY_CATEGORY">Sales by Service Category</option>
              <option value="REFUNDS_DETAIL">Refunds Report</option>
              <option value="TOP_SPENDING_CUSTOMERS">Top Spending Customers</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Start Date (Spans 2 columns) */}
          <div className="md:col-span-2 relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
                type="date"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                value={startDate.substring(0, 10)}
                onChange={(e) => onStartDateChange(new Date(e.target.value).toISOString())}
            />
          </div>

          {/* End Date (Spans 2 columns) */}
          <div className="md:col-span-2 relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
                type="date"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                value={endDate.substring(0, 10)}
                onChange={(e) => onEndDateChange(new Date(e.target.value + 'T23:59:59').toISOString())}
            />
          </div>

          {/* Limit (Spans 2 columns) - Conditional UI */}
          <div className={`md:col-span-2 relative group transition-opacity ${reportType !== 'TOP_SPENDING_CUSTOMERS' ? 'opacity-50' : 'opacity-100'}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <select
                value={limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                disabled={reportType !== 'TOP_SPENDING_CUSTOMERS'}
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Actions (Spans 2 columns) */}
          <div className="md:col-span-2 flex items-center gap-2">
            <button
                onClick={onReset}
                className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                title="Reset Filters"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <button
                onClick={onApply}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <span>Run</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      </div>
  )
}

export default ReportsFilterBar