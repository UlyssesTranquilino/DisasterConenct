import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export type UserRole = 'Citizen' | 'Organization' | 'Volunteer'
export type CurrentUser = { role: UserRole; name: string }

type AuthContextValue = {
  currentUser: CurrentUser | null
  isLoading: boolean
  login: (role: UserRole, name?: string) => void
  register: (role: UserRole, name?: string) => void
  logout: () => void
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

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = getUserFromStorage()
    if (storedUser) {
      setCurrentUser(storedUser)
    }
    setIsLoading(false)
  }, [])

  const login = (role: UserRole, name = 'Guest') => {
    const user = { role, name }
    setCurrentUser(user)
    saveUserToStorage(user)
    if (role === 'Citizen') navigate('/citizen/dashboard')
    if (role === 'Organization') navigate('/org/dashboard')
    if (role === 'Volunteer') navigate('/volunteer/dashboard')
  }

  const register = (role: UserRole, name = 'New User') => {
    console.log('Registered', { role, name })
    login(role, name)
  }

  const logout = () => {
    setCurrentUser(null)
    removeUserFromStorage()
    navigate('/login')
  }

  const value = useMemo(() => ({ currentUser, isLoading, login, register, logout }), [currentUser, isLoading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


