import React, { useEffect, useState } from 'react'
import { Product, ProductService } from '../services/productService'
import ProductList from '../components/services/ProductList'
import ProductFormModal from '../components/services/ProductFormModal'
import DeleteConfirmationModal from '../components/services/DeleteConfirmationModal'
import { PenTool as Tool, Plus, AlertCircle, CheckCircle } from 'lucide-react'

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
      await loadProducts() // Reload products to show changes
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
      await loadProducts() // Reload products to show changes
    } else {
      setError(result.message)
    }
    setDeleteLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Services</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your service offerings and pricing models.
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={clearMessages} className="ml-auto text-red-500 hover:text-red-700">
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
          <button onClick={clearMessages} className="ml-auto text-green-500 hover:text-green-700">
            ×
          </button>
        </div>
      )}

      {/* Add New Service Button */}
      <div className="flex justify-end">
        <button
          onClick={handleAddProduct}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Product List */}
      <ProductList
        products={products}
        loading={loading}
        error={error}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSave={handleSaveProduct}
        initialProduct={editingProduct}
        loading={formLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        itemName={productToDelete?.product_name || ''}
        loading={deleteLoading}
      />
    </div>
  )
}

export default Services
