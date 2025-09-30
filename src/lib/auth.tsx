import React, { createContext, useContext, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export type UserRole = 'Citizen' | 'Organization' | 'Volunteer'
export type CurrentUser = { role: UserRole; name: string }

type AuthContextValue = {
  currentUser: CurrentUser | null
  login: (role: UserRole, name?: string) => void
  register: (role: UserRole, name?: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)

  const login = (role: UserRole, name = 'Guest') => {
    const user = { role, name }
    setCurrentUser(user)
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
    navigate('/login')
  }

  const value = useMemo(() => ({ currentUser, login, register, logout }), [currentUser])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


