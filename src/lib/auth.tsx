import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiService, type User } from './api'

// 👇 NEW CODE FOR GOOGLE LOGIN
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

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
  // 👇 Add Google login to the hook
  loginWithGoogle: () => Promise<void>
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
          const profile = await apiService.getProfile()
          setCurrentUser(profile.data.user as CurrentUser)
        } else {
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
      
      const normalizedUser = {
        ...user,
        role: user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() as UserRole
      }
      
      apiService.setToken(response.data.token)
      setCurrentUser(normalizedUser)
      saveUserToStorage(normalizedUser)
      
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

  // 👇 NEW: Google Login Method
  const loginWithGoogle = async () => {
    try {
      setError(null)
      setIsLoading(true)

      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      // Map Firebase user to your local user structure
      const googleUser: CurrentUser = {
        id: user.uid,
        email: user.email || '',
        name: user.displayName || 'Google User',
        role: 'Citizen', // default role
      }

      // If your backend supports Google login, you could call apiService.loginGoogle(user)
      saveUserToStorage(googleUser)
      setCurrentUser(googleUser)

      navigate('/citizen/dashboard')

    } catch (error) {
      console.error('Google login failed:', error)
      setError('Google login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const value = useMemo(() => ({ 
    currentUser, 
    isLoading, 
    login, 
    register, 
    logout, 
    error,
    loginWithGoogle, // 👈 include it in the context
  }), [currentUser, isLoading, error])
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
