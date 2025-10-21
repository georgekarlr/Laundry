import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PersonaProtectedRoute from './components/PersonaProtectedRoute'
import Layout from './components/layout/Layout'
import LoginForm from './components/auth/LoginForm'
import SignupForm from './components/auth/SignupForm'
import Dashboard from './pages/Dashboard'
import PersonaManagement from './pages/PersonaManagement'
import Customers from './pages/Customers'
import Services from './pages/Services'
import NewOrderPage from './pages/NewOrderPage'
import Orders from './pages/Orders'
import Garments from './pages/Garments'
import Transactions from './pages/Transactions'
import Reports from './pages/Reports'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/new-order" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <NewOrderPage />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/orders" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <Orders />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/garments" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <Garments />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/customers" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <Customers /> {/* Render the new Customers component */}
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/services" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <Services/>
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/finance/reports" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/finance/transactions" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <Transactions />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/persona-management" element={
            <ProtectedRoute>
              <PersonaProtectedRoute>
                <Layout>
                  <PersonaManagement />
                </Layout>
              </PersonaProtectedRoute>
            </ProtectedRoute>
          } />
          
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App