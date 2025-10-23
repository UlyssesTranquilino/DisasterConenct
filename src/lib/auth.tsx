import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiService, type User } from './api'
import { signInWithPopup } from 'firebase/auth'
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
  loginWithGoogle: () => Promise<void>
  register: (email: string, password: string, name: string, role: UserRole, profileData?: any) => Promise<void>
  completeGoogleProfile: (userInfo: any, role: UserRole, profileData: any) => Promise<void>
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

  const register = async (email: string, password: string, name: string, role: UserRole, profileData?: any) => {
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



  const completeGoogleProfile = async (userInfo: any, role: UserRole, profileData: any) => {
    try {
      setError(null)
      setIsLoading(true)
      
      // Send the ID token with role and profile data to backend
      const response = await apiService.googleLogin(userInfo.idToken, role.toLowerCase(), profileData)
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
      
      // Navigate based on role
      if (normalizedUser.role === 'Citizen') {
        navigate('/citizen/dashboard')
      } else if (normalizedUser.role === 'Organization') {
        navigate('/org/dashboard')
      } else if (normalizedUser.role === 'Volunteer') {
        navigate('/volunteer/dashboard')
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile completion failed'
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
      const idToken = await user.getIdToken()

      // Store Google user info temporarily for role selection
      const googleUserInfo = {
        idToken,
        email: user.email || '',
        name: user.displayName || 'Google User',
        uid: user.uid
      }
      
      // Try to login with backend (check if user exists)
      try {
        const response = await apiService.googleLogin(idToken)
        const backendUser = response.data.user as CurrentUser
        
        // User exists - log them in
        const normalizedUser = {
          ...backendUser,
          role: backendUser.role.charAt(0).toUpperCase() + backendUser.role.slice(1).toLowerCase() as UserRole
        }
        
        apiService.setToken(response.data.token)
        setCurrentUser(normalizedUser)
        saveUserToStorage(normalizedUser)
        
        // Navigate based on role
        if (normalizedUser.role === 'Citizen') {
          navigate('/citizen/dashboard')
        } else if (normalizedUser.role === 'Organization') {
          navigate('/org/dashboard')
        } else if (normalizedUser.role === 'Volunteer') {
          navigate('/volunteer/dashboard')
        }
        
      } catch (backendError: any) {
        // User doesn't exist in backend - redirect to role selection
        if (backendError.message?.includes('not found') || 
            backendError.message?.includes('User not registered') ||
            backendError.message?.includes('User does not exist')) {
          // Store Google user info in sessionStorage for role selection page
          sessionStorage.setItem('googleUserInfo', JSON.stringify(googleUserInfo))
          navigate('/select-role')
          return // Exit early to prevent error from being thrown
        } else {
          throw backendError
        }
      }

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
    loginWithGoogle, 
    register, 
    completeGoogleProfile,
    logout, 
    error,

  }), [currentUser, isLoading, error])
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
