import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: ('admin' | 'staff' | 'driver')[]
  adminOnly?: boolean
  staffOnly?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles,
  adminOnly = false,
  staffOnly = false
}) => {
  const { isAuthenticated, user, isLoading } = useAuth()

  // While loading, show nothing (or could show a loading spinner)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5E372E]"></div>
      </div>
    )
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  // Admin only route
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  // Staff only route
  if (staffOnly && user.role !== 'staff' && user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  // Check required roles
  if (requiredRoles && !requiredRoles.includes(user.role as 'admin' | 'staff' | 'driver')) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
