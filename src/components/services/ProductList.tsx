import React from 'react'
import { Product } from '../../services/productService'
import { Edit3, Trash2, Package, Tag, AlertCircle, Search, Layers } from 'lucide-react'

interface ProductListProps {
  products: Product[]
  loading: boolean
  error: string
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

const ProductList: React.FC<ProductListProps> = ({
                                                   products,
                                                   loading,
                                                   error,
                                                   onEdit,
                                                   onDelete,
                                                 }) => {

  // Helper for consistent badge styling
  const getModelBadge = (model: string) => {
    const formatted = model.replace(/_/g, ' ')
    let colors = "bg-slate-100 text-slate-600"

    if (model === 'FIXED') colors = "bg-indigo-50 text-indigo-700 border-indigo-200"
    if (model === 'PER_KG') colors = "bg-emerald-50 text-emerald-700 border-emerald-200"
    if (model === 'PER_ITEM') colors = "bg-amber-50 text-amber-700 border-amber-200"

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${colors}`}>
        <Tag className="w-3 h-3 mr-1" />
          {formatted}
      </span>
    )
  }

  // 1. Skeleton Loading State
  if (loading) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-200">
              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
            </div>
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 flex items-center justify-between animate-pulse">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-1/3 bg-slate-100 rounded" />
                    <div className="h-3 w-1/4 bg-slate-50 rounded" />
                  </div>
                  <div className="h-8 w-20 bg-slate-50 rounded" />
                </div>
            ))}
          </div>
        </div>
    )
  }

  // 2. Error State
  if (error) {
    return (
        <div className="bg-white rounded-2xl border border-red-100 p-8 text-center shadow-sm">
          <div className="mx-auto h-12 w-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Unable to load services</h3>
          <p className="text-red-600 mt-1 max-w-sm mx-auto">{error}</p>
        </div>
    )
  }

  // 3. Empty State
  if (products.length === 0) {
    return (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="mx-auto h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No services found</h3>
          <p className="text-slate-500 mt-1">Try adjusting filters or add a new service.</p>
        </div>
    )
  }

  return (
      <div className="w-full">
        {/* --- DESKTOP TABLE VIEW (Visible md+) --- */}
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
              <tr className="bg-slate-50/50">
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Service Name
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Pricing Model
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Base Price
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
              {products.map((product) => (
                  <tr key={product.product_id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                          <Package className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-900">{product.product_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getModelBadge(product.product_pricing_model)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-mono font-bold text-slate-700">
                      ${product.product_base_price.toFixed(2)}
                    </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => onEdit(product)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Service"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onDelete(product)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Service"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- MOBILE CARD VIEW (Visible < md) --- */}
        <div className="md:hidden grid grid-cols-1 gap-4">
          {products.map((product) => (
              <div key={product.product_id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{product.product_name}</h4>
                      <div className="mt-1">{getModelBadge(product.product_pricing_model)}</div>
                    </div>
                  </div>
                  <span className="text-lg font-mono font-bold text-slate-900">
                ${product.product_base_price.toFixed(2)}
              </span>
                </div>

                <div className="flex gap-2 pt-3 mt-3 border-t border-slate-100">
                  <button
                      onClick={() => onEdit(product)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" /> Edit
                  </button>
                  <button
                      onClick={() => onDelete(product)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
          ))}
        </div>
      </div>
  )
}

export default ProductList