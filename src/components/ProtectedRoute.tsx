'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'
import { LoginPage } from './LoginPage'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if we're not already on the login page and user is not authenticated
    if (!isLoading && !user && window.location.pathname !== '/login') {
      router.push('/login')
    }
  }, [user, isLoading, router])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-4">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Loading...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Checking authentication
          </p>
        </div>
      </div>
    )
  }

  // If not authenticated, show login component
  if (!user) {
    return <LoginPage />
  }

  // User is authenticated, show protected content
  return <>{children}</>
} 