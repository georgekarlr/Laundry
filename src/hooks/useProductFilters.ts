import { useState, useMemo } from 'react'
import { Product } from '../services/productService'

/**
 * Custom hook to manage product filtering logic.
 * @param products - The original array of products to be filtered.
 * @returns An object containing filtered products, filter states, and filter management functions.
 */
export const useProductFilters = (products: Product[]) => {
  // State for the product name filter
  const [productNameFilter, setProductNameFilter] = useState('')
  // State for the pricing model filter
  const [pricingModelFilter, setPricingModelFilter] = useState('')

  /**
   * Clears all active filters, resetting them to their default states.
   */
  const clearFilters = () => {
    setProductNameFilter('')
    setPricingModelFilter('')
  }

  // Memoized calculation of filtered products to avoid re-computation on every render
  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Apply product name filter if it's not empty
    if (productNameFilter) {
      filtered = filtered.filter((product) =>
        product.product_name.toLowerCase().includes(productNameFilter.toLowerCase())
      )
    }

    // Apply pricing model filter if a specific model is selected
    if (pricingModelFilter) {
      filtered = filtered.filter(
        (product) => product.product_pricing_model === pricingModelFilter
      )
    }

    return filtered
  }, [products, productNameFilter, pricingModelFilter]) // Dependencies for the memoization

  // Return the state values and functions to be used by the component
  return {
    filteredProducts,
    productNameFilter,
    pricingModelFilter,
    setProductNameFilter,
    setPricingModelFilter,
    clearFilters,
  }
}