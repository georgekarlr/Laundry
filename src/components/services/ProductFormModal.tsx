```typescript
import React, { useState, useEffect } from 'react'
import { Product } from '../../services/productService'
import { X, Package, DollarSign, Tag } from 'lucide-react'

interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (product: Omit<Product, 'product_id' | 'user_id' | 'person_name' | 'created_at'>, productId?: string) => void
  initialProduct?: Product | null
  loading: boolean
}

const pricingModels = ['FIXED', 'PER_KG', 'PER_ITEM'] as const

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
  loading,
}) => {
  const [productName, setProductName] = useState('')
  const [basePrice, setBasePrice] = useState<number | ''>('')
  const [pricingModel, setPricingModel] = useState<typeof pricingModels[number]>('FIXED')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (initialProduct) {
        setProductName(initialProduct.product_name)
        setBasePrice(initialProduct.product_base_price)
        setPricingModel(initialProduct.product_pricing_model)
      } else {
        setProductName('')
        setBasePrice('')
        setPricingModel('FIXED')
      }
      setError('')
    }
  }, [isOpen, initialProduct])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!productName.trim()) {
      setError('Service Name is required.')
      return
    }
    if (basePrice === '' || isNaN(Number(basePrice)) || Number(basePrice) < 0) {
      setError('Base Price must be a valid non-negative number.')
      return
    }

    onSave(
      {
        product_name: productName,
        product_base_price: Number(basePrice),
        product_pricing_model: pricingModel,
      },
      initialProduct?.product_id
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
            <div className="flex items-center space-x-3">
              <Package className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">
                {initialProduct ? 'Edit Service' : 'Add New Service'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
                Service Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="productName"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Dry Cleaning, Laundry"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-2">
                Base Price
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="basePrice"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 15.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="pricingModel" className="block text-sm font-medium text-gray-700 mb-2">
                Pricing Model
              </label>
              <select
                id="pricingModel"
                value={pricingModel}
                onChange={(e) => setPricingModel(e.target.value as typeof pricingModels[number])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {pricingModels.map((model) => (
                  <option key={model} value={model}>
                    {model.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                ) : (
                  initialProduct ? 'Update Service' : 'Add Service'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProductFormModal
```