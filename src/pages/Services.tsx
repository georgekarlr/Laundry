import React, { useEffect, useState } from 'react'
import { Product, ProductService } from '../services/productService'
import ProductList from '../components/services/ProductList'
import ProductFormModal from '../components/services/ProductFormModal'
import DeleteConfirmationModal from '../components/services/DeleteConfirmationModal'
import { useProductFilters } from '../hooks/useProductFilters'
import { Plus, AlertCircle, CheckCircle, Search, Tag, X, Briefcase, Filter, RotateCcw } from 'lucide-react'

const Services: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [showFormModal, setShowFormModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Integrate the custom hook for filtering
  const {
    filteredProducts,
    productNameFilter,
    pricingModelFilter,
    setProductNameFilter,
    setPricingModelFilter,
    clearFilters,
  } = useProductFilters(products)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    const result = await ProductService.getAllProducts()
    if (result.success && result.data) {
      setProducts(result.data)
    } else {
      setError(result.message)
    }
    setLoading(false)
  }

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const handleAddProduct = () => {
    clearMessages()
    setEditingProduct(null)
    setShowFormModal(true)
  }

  const handleEditProduct = (product: Product) => {
    clearMessages()
    setEditingProduct(product)
    setShowFormModal(true)
  }

  const handleDeleteProduct = (product: Product) => {
    clearMessages()
    setProductToDelete(product)
    setShowDeleteModal(true)
  }

  const handleSaveProduct = async (
      productData: Omit<Product, 'product_id' | 'user_id' | 'person_name' | 'created_at'>,
      productId?: string
  ) => {
    setFormLoading(true)
    clearMessages()
    let result
    if (productId) {
      result = await ProductService.updateProduct(productId, productData.product_name, productData.product_base_price, productData.product_pricing_model)
    } else {
      result = await ProductService.createProduct(productData.product_name, productData.product_base_price, productData.product_pricing_model)
    }

    if (result.success) {
      setSuccess(result.message)
      setShowFormModal(false)
      await loadProducts()
    } else {
      setError(result.message)
    }
    setFormLoading(false)
  }

  const handleConfirmDelete = async () => {
    if (!productToDelete) return

    setDeleteLoading(true)
    clearMessages()
    const result = await ProductService.deleteProduct(productToDelete.product_id)

    if (result.success) {
      setSuccess(result.message)
      setShowDeleteModal(false)
      setProductToDelete(null)
      await loadProducts()
    } else {
      setError(result.message)
    }
    setDeleteLoading(false)
  }

  return (
      <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 hidden sm:block">
                <Briefcase className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Services</h1>
                <p className="mt-1 text-sm text-slate-500 font-medium">
                  Manage your service offerings and pricing models.
                </p>
              </div>
            </div>
            <button
                onClick={handleAddProduct}
                className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Service
            </button>
          </div>

          {/* Status Messages */}
          <div className="space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3 shadow-sm animate-in slide-in-from-top-2">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm font-medium text-red-700 flex-1">{error}</p>
                  <button onClick={clearMessages} className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-100 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
            )}

            {success && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center space-x-3 shadow-sm animate-in slide-in-from-top-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <p className="text-sm font-medium text-emerald-700 flex-1">{success}</p>
                  <button onClick={clearMessages} className="text-emerald-400 hover:text-emerald-600 p-1 rounded-full hover:bg-emerald-100 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
            )}
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

            {/* Filter Ribbon */}
            <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <Filter className="h-3 w-3" /> Filters & Search
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Input */}
                <div className="relative flex-1 group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                      type="text"
                      placeholder="Filter by service name..."
                      value={productNameFilter}
                      onChange={(e) => setProductNameFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Pricing Model Select */}
                <div className="relative w-full md:w-64 group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Tag className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <select
                      value={pricingModelFilter}
                      onChange={(e) => setPricingModelFilter(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none cursor-pointer text-slate-600 font-medium"
                  >
                    <option value="">All Pricing Models</option>
                    <option value="FIXED">Fixed Price</option>
                    <option value="PER_KG">Per KG</option>
                    <option value="PER_ITEM">Per Item</option>
                  </select>
                  {/* Custom Chevron for select */}
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Clear Button */}
                <button
                    onClick={clearFilters}
                    className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center justify-center gap-2 shadow-sm"
                    title="Reset Filters"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="md:hidden">Reset</span>
                </button>
              </div>
            </div>

            {/* Product List */}
            <div className="min-h-[400px]">
              <ProductList
                  products={filteredProducts}
                  loading={loading}
                  error={error}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
              />
            </div>
          </div>

          {/* Modals */}
          <ProductFormModal
              isOpen={showFormModal}
              onClose={() => setShowFormModal(false)}
              onSave={handleSaveProduct}
              initialProduct={editingProduct}
              loading={formLoading}
          />

          <DeleteConfirmationModal
              isOpen={showDeleteModal}
              onClose={() => setShowDeleteModal(false)}
              onConfirm={handleConfirmDelete}
              itemName={productToDelete?.product_name || ''}
              loading={deleteLoading}
          />
        </div>
      </div>
  )
}

export default Services