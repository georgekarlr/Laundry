import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { LayoutDashboard, PlusCircle, Package, Users, PenTool as Tool, DollarSign, Receipt, ChevronDown, ChevronUp, X, Shield } from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const adminNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'New Order', href: '/new-order', icon: PlusCircle },
  { name: 'Orders', href: '/orders', icon: Package },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Services', href: '/services', icon: Tool },
  { 
    name: 'FINANCE', 
    icon: DollarSign, 
    children: [
      { name: 'Reports', href: '/finance/reports', icon: Receipt },
      { name: 'Transactions', href: '/finance/transactions', icon: DollarSign }
    ]
  },
  { name: 'Persona Management', href: '/persona-management', icon: Shield },
]

const staffNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'New Order', href: '/new-order', icon: PlusCircle },
  { name: 'Orders', href: '/orders', icon: Package },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Services', href: '/services', icon: Tool },
  { 
    name: 'FINANCE', 
    icon: DollarSign, 
    children: [
      { name: 'Reports', href: '/finance/reports', icon: Receipt },
      { name: 'Transactions', href: '/finance/transactions', icon: DollarSign }
    ]
  },
]

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation()
  const { persona } = useAuth()
  const [financeOpen, setFinanceOpen] = useState(false)

  // Determine navigation based on persona
  const navigation = persona?.type === 'admin' ? adminNavigation : staffNavigation

  return (
    <>
      {/* Backdrop - shown on all screen sizes when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Your App</h1>
              {persona && (
                <p className="text-xs text-gray-500">
                  {persona.type === 'admin' ? 'Admin' : (persona.personName || persona.loginName || 'Staff')} Portal
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              // Handle FINANCE section with children
              if (item.children) {
                const isFinanceActive = location.pathname.startsWith('/finance')
                const Icon = item.icon
                
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => setFinanceOpen(!financeOpen)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                        ${isFinanceActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <div className="flex items-center">
                        <Icon className={`
                          h-5 w-5 mr-3 flex-shrink-0
                          ${isFinanceActive ? 'text-blue-700' : 'text-gray-400'}
                        `} />
                        {item.name}
                      </div>
                      {financeOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    
                    {financeOpen && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.children.map((child) => {
                          const isChildActive = location.pathname === child.href
                          const ChildIcon = child.icon
                          
                          return (
                            <Link
                              key={child.name}
                              to={child.href}
                              onClick={onClose}
                              className={`
                                flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                                ${isChildActive
                                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }
                              `}
                            >
                              <ChildIcon className={`
                                h-4 w-4 mr-3 flex-shrink-0
                                ${isChildActive ? 'text-blue-700' : 'text-gray-400'}
                              `} />
                              {child.name}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              }
              
              // Handle regular navigation items
              const isActive = location.pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`
                    h-5 w-5 mr-3 flex-shrink-0
                    ${isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'}
                  `} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}

export default Sidebar