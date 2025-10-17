import React, { useState, useEffect } from 'react'
import { Product, ProductService } from '../../services/productService'
import { OrderItem, GarmentData } from '../../types/order'
import { ArrowLeft, ArrowRight, Plus, Minus, Trash2, Package, DollarSign, AlertCircle, Edit, X } from 'lucide-react'

interface AddServicesStepProps {
  onNext: () => void
  onPrevious: () => void
  onAddOrderItem: (item: OrderItem) => void
  onRemoveOrderItem: (productId: string) => void
  onUpdateOrderItemQuantity: (productId: string, quantity: number) => void // For updating quantity of existing item
  onUpdateOrderItemGarments: (productId: string, garments: GarmentData[]) => void // For updating garments of existing item

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

  // State for garment modal
  const [showGarmentModal, setShowGarmentModal] = useState(false)
  const [currentOrderItemForGarments, setCurrentOrderItemForGarments] = useState<OrderItem | null>(null)
  const [garmentTagId, setGarmentTagId] = useState('')
  const [garmentDescription, setGarmentDescription] = useState('')
  const [garmentNotes, setGarmentNotes] = useState('')
  const [garmentModalError, setGarmentModalError] = useState('')
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
      garments: [] // Initialize with an empty array for garments
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

  const handleOpenGarmentModal = (item: OrderItem) => {
    setCurrentOrderItemForGarments(item)
    setShowGarmentModal(true)
    setGarmentModalError('')
  }

  const handleCloseGarmentModal = () => {
    setShowGarmentModal(false)
    setCurrentOrderItemForGarments(null)
    setGarmentTagId('')
    setGarmentDescription('')
    setGarmentNotes('')
    setGarmentModalError('')
  }

  const handleAddGarment = () => {
    if (!garmentTagId.trim() || !garmentDescription.trim()) {
      setGarmentModalError('Tag ID and Description are required.')
      return
    }

    if (currentOrderItemForGarments) {
      const newGarment: GarmentData = {
        tag_id: garmentTagId.trim(),
        description: garmentDescription.trim(),
        notes: garmentNotes.trim() ? { text: garmentNotes.trim() } : undefined, // Store notes as JSONB object
      }
      const updatedGarments = [...(currentOrderItemForGarments.garments || []), newGarment]
      onUpdateOrderItemGarments(currentOrderItemForGarments.product_id, updatedGarments)
      handleCloseGarmentModal()
    }
  }

  const handleEditGarment = (index: number, updatedGarment: GarmentData) => {
    if (currentOrderItemForGarments) {
      const updatedGarments = [...(currentOrderItemForGarments.garments || [])]
      updatedGarments[index] = updatedGarment
      onUpdateOrderItemGarments(currentOrderItemForGarments.product_id, updatedGarments)
    }
  }

  const handleRemoveGarment = (index: number) => {
    if (currentOrderItemForGarments) {
      const updatedGarments = (currentOrderItemForGarments.garments || []).filter((_, i) => i !== index)
      onUpdateOrderItemGarments(currentOrderItemForGarments.product_id, updatedGarments)
    }
  }

  const getGarmentCount = (productId: string) => {
    const item = initialOrderItems.find(i => i.product_id === productId)
    return item?.garments?.length || 0
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
                          type="button"
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
                        {item.garments && item.garments.length > 0 && (
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Package className="h-4 w-4" />
                            <span>{item.garments.length} Garment{item.garments.length !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
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
                            type="button"
                            onClick={() => handleOpenGarmentModal(item)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-md hover:bg-blue-200 transition-colors"
                          >
                            Add Garment
                          </button>
                          <button
                            onClick={() => handleRemoveOrderItem(item.product_id)}
                            className="p-1 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-gray-900">
                            Subtotal: ${(item.price_at_sale * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 text-right">
                        <span className="text-sm font-medium text-gray-900">
                          Subtotal: ${(item.price_at_sale * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      {/* Display Garments for this item */}
                      {item.garments && item.garments.length > 0 && (
                        <div className="mt-4 border-t border-gray-100 pt-3">
                          <p className="text-xs font-medium text-gray-700 mb-2">Garments:</p>
                          <div className="space-y-2">
                            {item.garments.map((garment, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                                <div>
                                  <p className="text-sm font-medium text-gray-800">{garment.tag_id}</p>
                                  <p className="text-xs text-gray-600">{garment.description}</p>
                                  {garment.notes && <p className="text-xs text-gray-500 italic">{garment.notes.text}</p>}
                                </div>
                                <div className="flex space-x-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenGarmentModal({ ...item, garments: [garment] })} // Pass single garment for editing
                                    className="p-1 rounded-md text-blue-400 hover:text-blue-600 hover:bg-blue-50"
                                    title="Edit Garment"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveGarment(index)}
                                    className="p-1 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50"
                                    title="Remove Garment"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
      {showGarmentModal && currentOrderItemForGarments && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleCloseGarmentModal}></div>
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-center space-x-3">
                  <Package className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Add Garment for {currentOrderItemForGarments.product_name}
                  </h3>
                </div>
                <button
                  onClick={handleCloseGarmentModal}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {garmentModalError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-700">{garmentModalError}</p>
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); handleAddGarment(); }} className="space-y-4">
                <div>
                  <label htmlFor="garmentTagId" className="block text-sm font-medium text-gray-700 mb-2">
                    Garment Tag ID *
                  </label>
                  <input
                    type="text"
                    id="garmentTagId"
                    value={garmentTagId}
                    onChange={(e) => setGarmentTagId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., G-001, Shirt-A1"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="garmentDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="garmentDescription"
                    value={garmentDescription}
                    onChange={(e) => setGarmentDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Men's white cotton shirt, size L"
                    required
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="garmentNotes" className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="garmentNotes"
                    value={garmentNotes}
                    onChange={(e) => setGarmentNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Missing button, stain on collar"
                  ></textarea>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="button" onClick={handleCloseGarmentModal} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Add Garment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddServicesStep