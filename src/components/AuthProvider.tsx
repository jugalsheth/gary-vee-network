'use client'

import * as React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import { showSuccessToast, showErrorToast } from '@/lib/toast'
import type { AuthUser, LoginCredentials } from '@/lib/auth'
import { saveSession, getSession, clearSession, isAuthenticated } from '@/lib/auth'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const { token, user: sessionUser } = getSession()
    if (token && sessionUser && isAuthenticated()) {
      setUser(sessionUser)
    }
    setIsLoading(false)
  }, [])

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setUser(data.user)
        saveSession(data.token, data.user)
        
        // Set cookie for server-side authentication
        if (typeof window !== 'undefined') {
          document.cookie = `auth_token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        }
        
        showSuccessToast.loginSuccess(data.user.username, data.user.team)
        return { success: true }
      } else {
        showErrorToast.loginFailed()
        return { success: false, error: data.error || 'Login failed' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error' }
    }
  }

  const logout = () => {
    setUser(null)
    clearSession()
    
    // Clear cookie
    if (typeof window !== 'undefined') {
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    
    // Show logout success toast
    showSuccessToast.logoutSuccess()
    
    // Call logout API
    fetch('/api/auth/logout', {
      method: 'POST',
    }).catch(console.error)
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 