import React, { useState, useEffect } from 'react'
import { Product } from '../../services/productService'
import { X, Package, DollarSign, Tag, ChevronDown, Check, Loader2, Layers } from 'lucide-react'

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
        />

        {/* Modal Container */}
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {initialProduct ? 'Edit Service' : 'Add New Service'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {initialProduct ? 'Update existing service details' : 'Create a new offering for customers'}
                </p>
              </div>
            </div>
            <button
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-3">
                  <div className="mt-0.5 text-red-500">
                    <X className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Service Name Input */}
              <div>
                <label htmlFor="productName" className="block text-sm font-bold text-slate-700 mb-1.5">
                  Service Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                      type="text"
                      id="productName"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400"
                      placeholder="e.g., Dry Cleaning, Wash & Fold"
                      required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Base Price Input */}
                <div>
                  <label htmlFor="basePrice" className="block text-sm font-bold text-slate-700 mb-1.5">
                    Base Price
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                        type="number"
                        id="basePrice"
                        value={basePrice}
                        onChange={(e) => setBasePrice(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                    />
                  </div>
                </div>

                {/* Pricing Model Select */}
                <div>
                  <label htmlFor="pricingModel" className="block text-sm font-bold text-slate-700 mb-1.5">
                    Pricing Model
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Layers className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <select
                        id="pricingModel"
                        value={pricingModel}
                        onChange={(e) => setPricingModel(e.target.value as typeof pricingModels[number])}
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none cursor-pointer font-medium text-slate-700"
                        required
                    >
                      {pricingModels.map((model) => (
                          <option key={model} value={model}>
                            {model.replace(/_/g, ' ')}
                          </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex gap-3 pt-4 mt-4 border-t border-slate-100">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    disabled={loading}
                >
                  Cancel
                </button>
                <button
                    type="submit"
                    className="flex-[2] flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-500/30 hover:-translate-y-0.5"
                    disabled={loading}
                >
                  {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                  ) : (
                      <>
                        <Check className="h-4 w-4" />
                        <span>{initialProduct ? 'Save Changes' : 'Create Service'}</span>
                      </>
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