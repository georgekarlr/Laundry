import React, { useState, useEffect } from 'react'
import { Product, ProductService } from '../../services/productService'
import { OrderItem, GarmentData } from '../../types/order'
import {
  ArrowLeft, ArrowRight, Plus, Minus, Trash2, Package,
  AlertCircle, Edit3, X, ShoppingBag, Tag,
  FileText, Shirt, Check
} from 'lucide-react'

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
  // Stores quantities only for items NOT yet in the cart
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
      garments: []
    }
    onAddOrderItem(orderItem)
    // We don't need to reset selectedQuantities here because the UI will switch
    // to displaying the cart quantity automatically
  }

  const handleProductQuantityChange = (product: Product, newQuantity: number, existingItem?: OrderItem) => {
    const qty = Math.max(1, newQuantity)

    if (existingItem) {
      // If item exists in cart, update cart directly (Live Sync)
      onUpdateOrderItemQuantity(product.product_id, qty)
    } else {
      // If not in cart, update local state
      setSelectedQuantities(prev => ({ ...prev, [product.product_id]: qty }))
    }
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
        notes: garmentNotes.trim() ? { text: garmentNotes.trim() } : undefined,
      }
      const updatedGarments = [...(currentOrderItemForGarments.garments || []), newGarment]
      onUpdateOrderItemGarments(currentOrderItemForGarments.product_id, updatedGarments)
      handleCloseGarmentModal()
    }
  }

  const removeGarmentDirectly = (item: OrderItem, index: number) => {
    const updatedGarments = (item.garments || []).filter((_, i) => i !== index)
    onUpdateOrderItemGarments(item.product_id, updatedGarments)
  }

  const getTotalAmount = () => {
    return initialOrderItems.reduce((total, item) => total + (item.price_at_sale * item.quantity), 0)
  }

  const canProceed = initialOrderItems.length > 0

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading product catalog...</p>
        </div>
    )
  }

  return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Add Services</h2>
            <p className="text-sm text-slate-500">Select items from the catalog to build the order.</p>
          </div>

          {/* Total Badge (Mobile only) */}
          <div className="sm:hidden bg-slate-900 text-white px-4 py-2 rounded-lg font-bold">
            ${getTotalAmount().toFixed(2)}
          </div>
        </div>

        {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT PANEL: PRODUCT CATALOG (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
              <ShoppingBag className="h-4 w-4" /> Available Services
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {products.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No services found in catalog.</p>
                  </div>
              ) : (
                  <div className="divide-y divide-slate-100">
                    {products.map((product) => {
                      // Check if item is already in cart
                      const existingItem = initialOrderItems.find(i => i.product_id === product.product_id)
                      // Use Cart Quantity if exists, otherwise Local State
                      const currentQty = existingItem ? existingItem.quantity : (selectedQuantities[product.product_id] || 1)

                      return (
                          <div key={product.product_id} className={`p-4 sm:p-5 transition-colors group ${existingItem ? 'bg-indigo-50/30' : 'hover:bg-slate-50/80'}`}>
                            <div className="flex items-center justify-between gap-4">
                              {/* Product Info */}
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-bold text-base ${existingItem ? 'text-indigo-900' : 'text-slate-900'}`}>
                                  {product.product_name}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              {product.product_pricing_model.replace(/_/g, ' ')}
                            </span>
                                  <span className="text-sm font-bold text-indigo-600">
                              ${product.product_base_price.toFixed(2)}
                            </span>
                                </div>
                              </div>

                              {/* Controls */}
                              <div className="flex items-center gap-3">
                                {/* Quantity Pill - Controls Cart Directly if Added */}
                                <div className={`flex items-center border rounded-lg shadow-sm h-9 ${existingItem ? 'bg-white border-indigo-200' : 'bg-white border-slate-200'}`}>
                                  <button
                                      onClick={() => handleProductQuantityChange(product, currentQty - 1, existingItem)}
                                      className="w-8 h-full flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-l-lg transition-colors disabled:opacity-30"
                                      disabled={currentQty <= 1}
                                  >
                                    <Minus className="h-3.5 w-3.5" />
                                  </button>
                                  <span className={`w-8 text-center text-sm font-semibold select-none ${existingItem ? 'text-indigo-700' : 'text-slate-900'}`}>
                              {currentQty}
                            </span>
                                  <button
                                      onClick={() => handleProductQuantityChange(product, currentQty + 1, existingItem)}
                                      className="w-8 h-full flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-r-lg transition-colors"
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                  </button>
                                </div>

                                {/* Add / Status Button */}
                                {existingItem ? (
                                    <button
                                        type="button"
                                        disabled
                                        className="h-9 px-4 bg-emerald-100 text-emerald-700 border border-emerald-200 text-sm font-bold rounded-lg flex items-center gap-1.5 cursor-default transition-all"
                                    >
                                      <Check className="h-4 w-4" />
                                      <span className="hidden sm:inline">In Cart</span>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleAddService(product)}
                                        className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-md shadow-indigo-200 transition-all active:scale-95 whitespace-nowrap"
                                    >
                                      Add
                                    </button>
                                )}
                              </div>
                            </div>
                          </div>
                      )
                    })}
                  </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: CART / RECEIPT (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-2"><FileText className="h-4 w-4" /> Current Order</span>
              <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md text-xs">
              {initialOrderItems.length} Items
            </span>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-200 shadow-inner overflow-hidden flex flex-col min-h-[400px]">
              {/* Scrollable Items Area */}
              <div className="flex-1 overflow-y-auto max-h-[600px] p-4 space-y-4">
                {initialOrderItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                        <Package className="h-8 w-8 text-slate-300" />
                      </div>
                      <p className="font-medium">Cart is empty</p>
                      <p className="text-sm">Select services to begin</p>
                    </div>
                ) : (
                    initialOrderItems.map((item) => (
                        <div key={item.product_id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 relative group hover:border-indigo-300 transition-colors">
                          {/* Item Header */}
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-bold text-slate-900">{item.product_name}</h4>
                              <p className="text-xs font-medium text-slate-500">
                                ${item.price_at_sale.toFixed(2)} × {item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-indigo-600">
                                ${(item.price_at_sale * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          </div>

                          {/* Item Actions Bar */}
                          <div className="flex items-center justify-between bg-slate-50 rounded-lg p-1.5 mb-3">
                            <div className="flex items-center bg-white border border-slate-200 rounded-md shadow-sm h-7">
                              <button
                                  onClick={() => onUpdateOrderItemQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                                  disabled={item.quantity <= 1}
                                  className="px-2 h-full text-slate-400 hover:text-indigo-600 disabled:opacity-30"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="px-1 min-w-[1.5rem] text-center text-xs font-bold text-slate-700">{item.quantity}</span>
                              <button
                                  onClick={() => onUpdateOrderItemQuantity(item.product_id, item.quantity + 1)}
                                  className="px-2 h-full text-slate-400 hover:text-indigo-600"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                  type="button"
                                  onClick={() => handleOpenGarmentModal(item)}
                                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-colors flex items-center gap-1"
                              >
                                <Plus className="h-3 w-3" /> Add Garment
                              </button>
                              <button
                                  onClick={() => handleRemoveOrderItem(item.product_id)}
                                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Garments List (Sub-items) */}
                          {item.garments && item.garments.length > 0 && (
                              <div className="mt-3 pl-3 border-l-2 border-indigo-100 space-y-2">
                                {item.garments.map((garment, idx) => (
                                    <div key={idx} className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 flex justify-between group/garment">
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                          <Tag className="h-3 w-3 text-indigo-400 flex-shrink-0" />
                                          <span className="text-xs font-bold text-slate-700 font-mono bg-white px-1.5 rounded border border-slate-200">
                                  {garment.tag_id}
                                </span>
                                        </div>
                                        <p className="text-xs text-slate-600 truncate pr-2">{garment.description}</p>
                                        {garment.notes && (
                                            <p className="text-[10px] text-amber-600 italic mt-0.5 flex items-start gap-1">
                                              <AlertCircle className="h-2.5 w-2.5 mt-0.5" />
                                              {garment.notes.text}
                                            </p>
                                        )}
                                      </div>
                                      <div className="flex flex-col gap-1 opacity-0 group-hover/garment:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleOpenGarmentModal({ ...item, garments: [garment] })}
                                            className="p-1 hover:bg-white rounded text-blue-500"
                                            title="Edit"
                                        >
                                          <Edit3 className="h-3 w-3" />
                                        </button>
                                        <button
                                            onClick={() => removeGarmentDirectly(item, idx)}
                                            className="p-1 hover:bg-white rounded text-red-500"
                                            title="Remove"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </div>
                                ))}
                              </div>
                          )}
                        </div>
                    ))
                )}
              </div>

              {/* Sticky Total Footer */}
              <div className="p-5 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-500 text-sm font-medium">Subtotal</span>
                  <span className="text-slate-900 font-bold">${getTotalAmount().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold text-slate-900">Total Due</span>
                  <span className="font-extrabold text-indigo-600 text-xl">${getTotalAmount().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="flex justify-between pt-6 border-t border-slate-200 mt-8">
          <button
              onClick={onPrevious}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <button
              onClick={onNext}
              disabled={!canProceed}
              className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 transition-all"
          >
            <span>Continue to Payment</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* MODAL: ADD GARMENT */}
        {showGarmentModal && currentOrderItemForGarments && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                  onClick={handleCloseGarmentModal}
              />

              <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Shirt className="h-5 w-5 text-indigo-600" />
                      Add Garment Details
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      For product: <span className="font-semibold text-slate-700">{currentOrderItemForGarments.product_name}</span>
                    </p>
                  </div>
                  <button onClick={handleCloseGarmentModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6">
                  {garmentModalError && (
                      <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {garmentModalError}
                      </div>
                  )}

                  <form onSubmit={(e) => { e.preventDefault(); handleAddGarment(); }} className="space-y-4">
                    <div>
                      <label htmlFor="garmentTagId" className="block text-sm font-bold text-slate-700 mb-1.5">
                        Unique Tag ID <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Tag className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            id="garmentTagId"
                            value={garmentTagId}
                            onChange={(e) => setGarmentTagId(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono text-sm"
                            placeholder="e.g. 10045"
                            autoFocus
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="garmentDescription" className="block text-sm font-bold text-slate-700 mb-1.5">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                          id="garmentDescription"
                          value={garmentDescription}
                          onChange={(e) => setGarmentDescription(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                          placeholder="e.g. Blue silk blouse, delicate cycle"
                      />
                    </div>

                    <div>
                      <label htmlFor="garmentNotes" className="block text-sm font-bold text-slate-700 mb-1.5">
                        Notes <span className="font-normal text-slate-400">(Optional)</span>
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            id="garmentNotes"
                            value={garmentNotes}
                            onChange={(e) => setGarmentNotes(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            placeholder="e.g. Stains, missing buttons..."
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 mt-2">
                      <button type="button" onClick={handleCloseGarmentModal} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors">
                        Cancel
                      </button>
                      <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all">
                        Save Garment
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