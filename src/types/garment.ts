export interface GarmentListItem {
  garment_id: string
  garment_tag_id: string | null
  garment_description: string | null
  garment_notes: any | null
  garment_status: string | null
  order_id: string
  customer_name: string
  created_at: string
}

export interface GarmentSearchParams {
  searchTerm?: string | null
  status?: string | null
  orderId?: string | null
  limit?: number
  offset?: number
}

// Detailed view result shape for get_garment_details
export interface GarmentDetails {
  garment_id: string
  garment_tag_id: string | null
  garment_description: string | null
  garment_notes: any | null
  garment_status: string | null
  garment_created_at: string
  order_id: string
  order_created_at: string
  customer_id: string
  customer_name: string
  product_name: string | null
}

// RPC return shapes for updates
export interface UpdateGarmentNotesResult {
  garment_id: string
  garment_tag_id: string | null
  garment_notes: any | null
  person_name: string
  garment_status: string | null
}

export interface UpdateGarmentDetailsResult {
  garment_id: string
  garment_tag_id: string | null
  garment_description: string | null
  person_name: string
  garment_status: string | null
}
