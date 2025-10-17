import React, { useState, useEffect } from 'react'
import { Product, ProductService } from '../../services/productService'
import { OrderItem, GarmentData } from '../../types/order'
import { ArrowLeft, ArrowRight, Plus, Minus, Trash2, Package, DollarSign, AlertCircle, Tag, FileText, X } from 'lucide-react'

interface AddServicesStepProps {
  onNext: () => void
  onPrevious: () => void
  onAddOrderItem: (item: OrderItem) => void
  onRemoveOrderItem: (productId: string) => void
  onUpdateOrderItemQuantity: (productId: string, quantity: number) => void
  onUpdateOrderItemGarments: (productId: string, garments: GarmentData[]) => void
  initialOrderItems: OrderItem[]
}

const AddServicesStep: React.FC<AddServicesStepProps> = ({
  onNext,
  onPrevious,
  onAddOrderItem,
  onRemoveOrderItem,
  onUpdateOrderItemQuantity,
  onUpdateOrderItemGarments,
  initialOrderItems
}) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedQuantities, setSelectedQuantities] = useState<{ [key: string]: number }>({})
  const [showGarmentModal, setShowGarmentModal] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [garmentForm, setGarmentForm] = useState<GarmentData>({ tag_id: '', description: '', notes: null })
  const [editingGarmentIndex, setEditingGarmentIndex] = useState<number | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    setError('')
    const result = await ProductService.getAllProducts()
    if (result.success && result.data) {
      setProducts(result.data)
    } else {
      setError(result.message)
    }
    setLoading(false)
  }

  const handleAddService = (product: Product) => {
    const quantity = selectedQuantities[product.product_id] || 1
    const orderItem: OrderItem = {
      product_id: product.product_id,
      product_name: product.product_name,
      quantity,
      price_at_sale: product.product_base_price,
      product_pricing_model: product.product_pricing_model,
      garments: []
    }
    onAddOrderItem(orderItem)
    setSelectedQuantities(prev => ({ ...prev, [product.product_id]: 1 }))
  }

  const handleQuantityChange = (productId: string, quantity: number) => {
    setSelectedQuantities(prev => ({ ...prev, [productId]: Math.max(1, quantity) }))
  }

  const handleUpdateOrderQuantity = (productId: string, quantity: number) => {
    onUpdateOrderItemQuantity(productId, quantity)
  }

  const handleRemoveOrderItem = (productId: string) => {
    onRemoveOrderItem(productId)
  }

  const handleAddGarment = (productId: string) => {
    setSelectedProductId(productId)
    setGarmentForm({ tag_id: '', description: '', notes: null })
    setEditingGarmentIndex(null)
    setShowGarmentModal(true)
  }

  const handleEditGarment = (productId: string, garmentIndex: number) => {
    const orderItem = initialOrderItems.find(item => item.product_id === productId)
    if (orderItem && orderItem.garments && orderItem.garments[garmentIndex]) {
      setSelectedProductId(productId)
      setGarmentForm({ ...orderItem.garments[garmentIndex] })
      setEditingGarmentIndex(garmentIndex)
      setShowGarmentModal(true)
    }
  }

  const handleSaveGarment = () => {
    if (!garmentForm.tag_id.trim() || !garmentForm.description.trim()) {
      return
    }

    const orderItem = initialOrderItems.find(item => item.product_id === selectedProductId)
    if (!orderItem) return

    const currentGarments = orderItem.garments || []
    let updatedGarments: GarmentData[]

    if (editingGarmentIndex !== null) {
      // Edit existing garment
      updatedGarments = [...currentGarments]
      updatedGarments[editingGarmentIndex] = { ...garmentForm }
    } else {
      // Add new garment
      updatedGarments = [...currentGarments, { ...garmentForm }]
    }

    onUpdateOrderItemGarments(selectedProductId, updatedGarments)
    setShowGarmentModal(false)
    setGarmentForm({ tag_id: '', description: '', notes: null })
    setEditingGarmentIndex(null)
  }

  const handleRemoveGarment = (productId: string, garmentIndex: number) => {
    const orderItem = initialOrderItems.find(item => item.product_id === productId)
    if (!orderItem || !orderItem.garments) return

    const updatedGarments = orderItem.garments.filter((_, index) => index !== garmentIndex)
    onUpdateOrderItemGarments(productId, updatedGarments)
  }

  const getTotalAmount = () => {
    return initialOrderItems.reduce((total, item) => total + (item.price_at_sale * item.quantity), 0)
  }

  const canProceed = initialOrderItems.length > 0

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading services...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Add Services</h2>
        <p className="text-sm text-gray-600">Select services and specify quantities for this order</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Services */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Available Services</h3>
          <div className="bg-white shadow-sm rounded-lg">
            {products.length === 0 ? (
              <div className="p-6 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No services available</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {products.map((product) => (
                  <div key={product.product_id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{product.product_name}</h4>
                        <p className="text-sm text-gray-500">
                          ${product.product_base_price.toFixed(2)} - {product.product_pricing_model.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleQuantityChange(product.product_id, (selectedQuantities[product.product_id] || 1) - 1)}
                            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                            disabled={(selectedQuantities[product.product_id] || 1) <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center text-sm">
                            {selectedQuantities[product.product_id] || 1}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(product.product_id, (selectedQuantities[product.product_id] || 1) + 1)}
                            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleAddService(product)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
          <div className="bg-white shadow-sm rounded-lg">
            {initialOrderItems.length === 0 ? (
              <div className="p-6 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No items added yet</p>
                <p className="text-sm text-gray-500">Add services from the left panel</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-200">
                  {initialOrderItems.map((item) => (
                    <div key={item.product_id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                          <p className="text-sm text-gray-500">
                            ${item.price_at_sale.toFixed(2)} each - {item.product_pricing_model.replace(/_/g, ' ')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleUpdateOrderQuantity(item.product_id, item.quantity - 1)}
                              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateOrderQuantity(item.product_id, item.quantity + 1)}
                              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemoveOrderItem(item.product_id)}
                            className="p-1 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 text-right">
                        <span className="text-sm font-medium text-gray-900">
                          Subtotal: ${(item.price_at_sale * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      
                      {/* Garments Section */}
                      <div className="mt-3 border-t border-gray-100 pt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Garments ({item.garments?.length || 0})</span>
                          <button
                            onClick={() => handleAddGarment(item.product_id)}
                            className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Add Garment</span>
                          </button>
                        </div>
                        
                        {item.garments && item.garments.length > 0 && (
                          <div className="space-y-1">
                            {item.garments.map((garment, garmentIndex) => (
                              <div key={garmentIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <Tag className="h-3 w-3 text-gray-400" />
                                    <span className="text-xs font-medium text-gray-900">{garment.tag_id}</span>
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1">{garment.description}</p>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => handleEditGarment(item.product_id, garmentIndex)}
                                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                  >
                                    <FileText className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => handleRemoveGarment(item.product_id, garmentIndex)}
                                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-gray-900">Total Amount:</span>
                    <span className="text-lg font-bold text-blue-600">${getTotalAmount().toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          className="flex items-center space-x-2 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Previous: Customer</span>
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span>Next: Payment</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Garment Modal */}
      {showGarmentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowGarmentModal(false)}></div>
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingGarmentIndex !== null ? 'Edit Garment' : 'Add Garment'}
                </h3>
                <button
                  onClick={() => setShowGarmentModal(false)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tag ID *
                  </label>
                  <input
                    type="text"
                    value={garmentForm.tag_id}
                    onChange={(e) => setGarmentForm(prev => ({ ...prev, tag_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter tag ID"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={garmentForm.description}
                    onChange={(e) => setGarmentForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter garment description"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={garmentForm.notes || ''}
                    onChange={(e) => setGarmentForm(prev => ({ ...prev, notes: e.target.value || null }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter additional notes"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-6">
                <button
                  onClick={() => setShowGarmentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveGarment}
                  disabled={!garmentForm.tag_id.trim() || !garmentForm.description.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {editingGarmentIndex !== null ? 'Update' : 'Add'} Garment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddServicesStep