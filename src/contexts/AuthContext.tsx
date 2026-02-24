import React, { createContext, useContext, useState, ReactNode } from 'react'

export type UserRole = 'admin' | 'user'
export type UserStatus = 'approved' | 'pending' | 'rejected'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  password?: string
}

interface AuthContextType {
  currentUser: User | null
  users: User[]
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (name: string, email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  approveUser: (id: string) => void
  rejectUser: (id: string) => void
  promoteToAdmin: (id: string) => void
}

const mockUsers: User[] = [
  {
    id: 'u0',
    name: 'Allan Tomazela',
    email: 'allantomazela@gmail.com',
    role: 'admin',
    status: 'approved',
    password: 'danilan2710',
  },
  {
    id: 'u1',
    name: 'Administrador Principal',
    email: 'admin@hcfmb.br',
    role: 'admin',
    status: 'approved',
    password: 'admin',
  },
  {
    id: 'u2',
    name: 'Nutricionista Silva',
    email: 'nutri@hcfmb.br',
    role: 'user',
    status: 'approved',
    password: 'user',
  },
  {
    id: 'u3',
    name: 'João Pendente',
    email: 'joao@hcfmb.br',
    role: 'user',
    status: 'pending',
    password: '123',
  },
]

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>(mockUsers)

  const login = async (email: string, password: string) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600))
    const user = users.find((u) => u.email === email && u.password === password)
    if (!user) throw new Error('Credenciais inválidas.')
    if (user.status === 'pending')
      throw new Error('Sua conta aguarda aprovação do administrador.')
    if (user.status === 'rejected') throw new Error('Sua conta foi recusada.')

    setCurrentUser(user)
  }

  const logout = () => setCurrentUser(null)

  const register = async (name: string, email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    if (users.some((u) => u.email === email))
      throw new Error('E-mail já cadastrado.')

    setUsers([
      ...users,
      {
        id: `u${users.length + 1}`,
        name,
        email,
        password,
        role: 'user',
        status: 'pending',
      },
    ])
  }

  const resetPassword = async (email: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    // Just simulated success
  }

  const approveUser = (id: string) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, status: 'approved' } : u)))
  }

  const rejectUser = (id: string) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, status: 'rejected' } : u)))
  }

  const promoteToAdmin = (id: string) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, role: 'admin' } : u)))
  }

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        currentUser,
        users,
        login,
        logout,
        register,
        resetPassword,
        approveUser,
        rejectUser,
        promoteToAdmin,
      },
    },
    children,
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined)
    throw new Error('useAuth must be used within AuthProvider')
  return context
}
