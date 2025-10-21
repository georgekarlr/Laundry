import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { DollarSign } from 'lucide-react'
import TransactionsFilterBar from '../components/transactions/TransactionsFilterBar'
import TransactionsTable from '../components/transactions/TransactionsTable'
import type { TransactionListItem } from '../types/transaction'
import { TransactionService } from '../services/transactionService'
import ExportMenu from '../components/common/ExportMenu'
import type { ExportColumn } from '../utils/exportUtils'

const Transactions: React.FC = () => {
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [transactionType, setTransactionType] = useState('ALL')
  const [paymentMethod, setPaymentMethod] = useState('ALL')
  const [personName, setPersonName] = useState('')
  const [limit, setLimit] = useState(50)

  // Data state
  const [transactions, setTransactions] = useState<TransactionListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const { success, data, message } = await TransactionService.searchTransactions({
      searchTerm: searchTerm || null,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
      transactionType: transactionType === 'ALL' ? null : transactionType,
      paymentMethod: paymentMethod === 'ALL' ? null : paymentMethod,
      personName: personName || null,
      limit,
      offset: 0,
    })

    if (!success) {
      setError(message || 'Failed to load transactions')
      setTransactions([])
    } else {
      setTransactions(data || [])
    }

    setLoading(false)
  }, [searchTerm, startDate, endDate, transactionType, paymentMethod, personName, limit])

  useEffect(() => {
    // Initial load
    load()
  }, [])

  const handleReset = () => {
    setSearchTerm('')
    setStartDate('')
    setEndDate('')
    setTransactionType('ALL')
    setPaymentMethod('ALL')
    setPersonName('')
    setLimit(50)
  }

  const exportColumns = useMemo<ExportColumn<TransactionListItem>[]>(() => [
    { key: 'transaction_date', label: 'Date', format: (v) => v ? new Date(v).toLocaleString() : '' },
    { key: 'customer_name', label: 'Customer' },
    { key: 'order_id', label: 'Order' },
    { key: 'transaction_type', label: 'Type' },
    { key: 'transaction_payment_method', label: 'Method' },
    { key: 'transaction_amount', label: 'Amount', format: (v, row: any) => `${row?.transaction_type === 'REFUND' ? '-' : ''}${Number(v ?? 0).toFixed(2)}` },
    { key: 'person_name', label: 'Processed By' },
  ], [])

  const filenameBase = useMemo(() => {
    let base = 'transactions'
    if (startDate) base += `_from-${startDate}`
    if (endDate) base += `_to-${endDate}`
    return base
  }, [startDate, endDate])

  const exportSubtitle = useMemo(() => {
    const parts: string[] = []
    if (startDate) parts.push(`From ${startDate}`)
    if (endDate) parts.push(`To ${endDate}`)
    if (transactionType !== 'ALL') parts.push(`Type: ${transactionType}`)
    if (paymentMethod !== 'ALL') parts.push(`Method: ${paymentMethod}`)
    if (personName) parts.push(`Processed by: ${personName}`)
    if (searchTerm) parts.push(`Search: ${searchTerm}`)
    return parts.join(' | ') || 'All transactions'
  }, [startDate, endDate, transactionType, paymentMethod, personName, searchTerm])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <DollarSign className="h-6 w-6 mr-2 text-blue-600" />
            Transactions
          </h1>
          <p className="text-sm text-gray-500">A detailed, filterable log of payments and refunds for auditing and troubleshooting.</p>
        </div>
        <div>
          <ExportMenu
            rows={transactions}
            columns={exportColumns}
            filenameBase={filenameBase}
            title="Transactions"
            subtitle={exportSubtitle}
            disabled={loading || !!error || transactions.length === 0}
          />
        </div>
      </div>

      {/* Filters */}
      <TransactionsFilterBar
        searchTerm={searchTerm}
        startDate={startDate}
        endDate={endDate}
        transactionType={transactionType}
        paymentMethod={paymentMethod}
        personName={personName}
        limit={limit}
        onSearchTermChange={setSearchTerm}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onTransactionTypeChange={setTransactionType}
        onPaymentMethodChange={setPaymentMethod}
        onPersonNameChange={setPersonName}
        onLimitChange={setLimit}
        onApply={load}
        onReset={handleReset}
      />

      {/* Table */}
      <TransactionsTable transactions={transactions} loading={loading} error={error} />
    </div>
  )
}

export default Transactions
