import { supabase } from '../lib/supabase'
import type { ServiceResult } from './orderService'
import type { TransactionListItem, TransactionSearchParams } from '../types/transaction'

export class TransactionService {
  static async searchTransactions(params: TransactionSearchParams = {}): Promise<ServiceResult<TransactionListItem[]>> {
    const {
      searchTerm = null,
      startDate = null,
      endDate = null,
      transactionType = null,
      paymentMethod = null,
      personName = null,
      limit = 50,
      offset = 0,
    } = params

    try {
      const { data, error } = await supabase.rpc('search_transactions', {
        p_search_term: searchTerm,
        p_start_date: startDate,
        p_end_date: endDate,
        p_transaction_type: transactionType,
        p_payment_method: paymentMethod,
        p_person_name: personName,
        p_limit: limit,
        p_offset: offset,
      })

      if (error) {
        console.error('search_transactions error:', error)
        return { success: false, message: 'Failed to load transactions' }
      }

      return {
        success: true,
        data: (data || []) as TransactionListItem[],
        message: 'Transactions loaded successfully',
      }
    } catch (e) {
      console.error('search_transactions exception:', e)
      return { success: false, message: 'Network error occurred' }
    }
  }
}