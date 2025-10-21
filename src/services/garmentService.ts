import { supabase } from '../lib/supabase'
import type { ServiceResult } from './orderService'
import type { GarmentListItem, GarmentSearchParams, GarmentDetails, UpdateGarmentDetailsResult, UpdateGarmentNotesResult } from '../types/garment'

export class GarmentService {
  static async findGarments(params: GarmentSearchParams = {}): Promise<ServiceResult<GarmentListItem[]>> {
    const {
      searchTerm = null,
      status = null,
      orderId = null,
      limit = 20,
      offset = 0,
    } = params

    try {
      const { data, error } = await supabase.rpc('find_garments', {
        p_search_term: searchTerm,
        p_status: status,
        p_order_id: orderId,
        p_limit: limit,
        p_offset: offset,
      })

      if (error) {
        console.error('find_garments error:', error)
        return { success: false, message: 'Failed to load garments' }
      }

      return {
        success: true,
        data: (data || []) as GarmentListItem[],
        message: 'Garments loaded successfully'
      }
    } catch (e) {
      console.error('find_garments exception:', e)
      return { success: false, message: 'Network error occurred' }
    }
  }

  static async getGarmentDetails(garmentId: string): Promise<ServiceResult<GarmentDetails>> {
    try {
      const { data, error } = await supabase.rpc('get_garment_details', {
        p_garment_id: garmentId,
      })

      if (error) {
        console.error('get_garment_details error:', error)
        return { success: false, message: 'Failed to load garment details' }
      }

      const row = Array.isArray(data) ? (data[0] as GarmentDetails | undefined) : undefined
      if (!row) {
        return { success: false, message: 'Garment not found' }
      }

      return { success: true, data: row, message: 'Garment details loaded successfully' }
    } catch (e) {
      console.error('get_garment_details exception:', e)
      return { success: false, message: 'Network error occurred' }
    }
  }

  static async updateGarmentStatusBulk(garmentIds: string[], newStatus: string): Promise<ServiceResult<number>> {
    try {
      const { data, error } = await supabase.rpc('update_garment_status_bulk', {
        p_garment_ids: garmentIds,
        p_new_status: newStatus,
      })

      if (error) {
        console.error('update_garment_status_bulk error:', error)
        return { success: false, message: 'Failed to update garment statuses' }
      }

      return {
        success: true,
        data: (data as unknown as number) ?? 0,
        message: 'Garment statuses updated successfully'
      }
    } catch (e) {
      console.error('update_garment_status_bulk exception:', e)
      return { success: false, message: 'Network error occurred' }
    }
  }

  static async updateGarmentNotes(garmentId: string, newNotes: any, personName: string): Promise<ServiceResult<UpdateGarmentNotesResult>> {
    try {
      const { data, error } = await supabase.rpc('update_garment_notes', {
        p_garment_id: garmentId,
        p_new_notes: newNotes,
        p_person_name: personName,
      })

      if (error) {
        console.error('update_garment_notes error:', error)
        return { success: false, message: 'Failed to update garment notes' }
      }

      const row = Array.isArray(data) ? (data[0] as UpdateGarmentNotesResult | undefined) : undefined
      if (!row) {
        return { success: false, message: 'No data returned from update_garment_notes' }
      }

      return { success: true, data: row, message: 'Garment notes updated successfully' }
    } catch (e) {
      console.error('update_garment_notes exception:', e)
      return { success: false, message: 'Network error occurred' }
    }
  }

  static async updateGarmentDetails(garmentId: string, personName: string, newDescription: string | null = null): Promise<ServiceResult<UpdateGarmentDetailsResult>> {
    try {
      const { data, error } = await supabase.rpc('update_garment_details', {
        p_garment_id: garmentId,
        p_person_name: personName,
        p_new_description: newDescription,
      })

      if (error) {
        console.error('update_garment_details error:', error)
        return { success: false, message: 'Failed to update garment details' }
      }

      const row = Array.isArray(data) ? (data[0] as UpdateGarmentDetailsResult | undefined) : undefined
      if (!row) {
        return { success: false, message: 'No data returned from update_garment_details' }
      }

      return { success: true, data: row, message: 'Garment details updated successfully' }
    } catch (e) {
      console.error('update_garment_details exception:', e)
      return { success: false, message: 'Network error occurred' }
    }
  }
}
