```typescript
import { supabase } from '../lib/supabase'

export interface Product {
  product_id: string
  user_id: string
  person_name: string | null
  product_name: string
  product_category: string | null
  product_pricing_model: 'FIXED' | 'PER_KG' | 'PER_ITEM'
  product_base_price: number
  created_at: string
}

export interface ServiceResult<T> {
  success: boolean
  data?: T
  message: string
}

export class ProductService {
  static async getAllProducts(): Promise<ServiceResult<Product[]>> {
    try {
      const { data, error } = await supabase
        .from('acd_products')
        .select('*')
        .order('product_name', { ascending: true })

      if (error) {
        console.error('Error fetching products:', error)
        return { success: false, message: error.message }
      }

      return { success: true, data: data as Product[], message: 'Products fetched successfully' }
    } catch (error) {
      console.error('Network error fetching products:', error)
      return { success: false, message: 'Network error occurred' }
    }
  }

  static async createProduct(
    product_name: string,
    product_base_price: number,
    product_pricing_model: 'FIXED' | 'PER_KG' | 'PER_ITEM'
  ): Promise<ServiceResult<Product>> {
    try {
      const { data, error } = await supabase
        .from('acd_products')
        .insert({
          product_name,
          product_base_price,
          product_pricing_model,
          // user_id and person_name will be automatically set by Supabase RLS policies if configured
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating product:', error)
        return { success: false, message: error.message }
      }

      return { success: true, data: data as Product, message: 'Product created successfully' }
    } catch (error) {
      console.error('Network error creating product:', error)
      return { success: false, message: 'Network error occurred' }
    }
  }

  static async updateProduct(
    product_id: string,
    product_name: string,
    product_base_price: number,
    product_pricing_model: 'FIXED' | 'PER_KG' | 'PER_ITEM'
  ): Promise<ServiceResult<Product>> {
    try {
      const { data, error } = await supabase
        .from('acd_products')
        .update({
          product_name,
          product_base_price,
          product_pricing_model,
        })
        .eq('product_id', product_id)
        .select()
        .single()

      if (error) {
        console.error('Error updating product:', error)
        return { success: false, message: error.message }
      }

      return { success: true, data: data as Product, message: 'Product updated successfully' }
    } catch (error) {
      console.error('Network error updating product:', error)
      return { success: false, message: 'Network error occurred' }
    }
  }

  static async deleteProduct(product_id: string): Promise<ServiceResult<null>> {
    try {
      const { error } = await supabase
        .from('acd_products')
        .delete()
        .eq('product_id', product_id)

      if (error) {
        console.error('Error deleting product:', error)
        return { success: false, message: error.message }
      }

      return { success: true, message: 'Product deleted successfully' }
    } catch (error) {
      console.error('Network error deleting product:', error)
      return { success: false, message: 'Network error occurred' }
    }
  }
}
```