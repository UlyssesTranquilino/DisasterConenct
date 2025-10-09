import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiService, type User } from './api'

export type UserRole = 'Citizen' | 'Organization' | 'Volunteer'
export type CurrentUser = { 
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

type AuthContextValue = {
  currentUser: CurrentUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>
  logout: () => void
  error: string | null
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// Helper functions for localStorage
const AUTH_STORAGE_KEY = 'disasterconnect_auth'

const saveUserToStorage = (user: CurrentUser) => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
  } catch (error) {
    console.error('Failed to save user to localStorage:', error)
  }
}

const getUserFromStorage = (): CurrentUser | null => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error('Failed to get user from localStorage:', error)
    return null
  }
}

const removeUserFromStorage = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch (error) {
    console.error('Failed to remove user from localStorage:', error)
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = getUserFromStorage()
        if (storedUser && apiService.isAuthenticated()) {
          // Verify token is still valid by fetching profile
          const profile = await apiService.getProfile()
          setCurrentUser(profile.data.user as CurrentUser)
        } else {
          // Clear invalid auth data
          apiService.removeToken()
          removeUserFromStorage()
        }
      } catch (error) {
        console.error('Failed to load user:', error)
        apiService.removeToken()
        removeUserFromStorage()
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      setIsLoading(true)
      
      const response = await apiService.login(email, password)
      const user = response.data.user as CurrentUser
      
      // Capitalize the role to match frontend expectations
      const normalizedUser = {
        ...user,
        role: user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() as UserRole
      }
      
      // Store token and user data
      apiService.setToken(response.data.token)
      setCurrentUser(normalizedUser)
      saveUserToStorage(normalizedUser)
      
      // Navigate to citizen dashboard after successful login
      navigate('/citizen/dashboard')
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      setError(null)
      setIsLoading(true)
      
      const response = await apiService.register(email, password, name, role.toLowerCase())
      
      // After successful registration, redirect to login page
      navigate('/login')
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setCurrentUser(null)
    setError(null)
    apiService.removeToken()
    removeUserFromStorage()
    navigate('/login')
  }

  const value = useMemo(() => ({ 
    currentUser, 
    isLoading, 
    login, 
    register, 
    logout, 
    error 
  }), [currentUser, isLoading, error])
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


