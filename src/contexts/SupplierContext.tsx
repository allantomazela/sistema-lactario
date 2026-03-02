import React, { createContext, useContext, useState, ReactNode } from 'react'

export type Supplier = {
  id: string
  name: string
  contact: string
  email: string
}

interface SupplierContextType {
  suppliers: Supplier[]
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void
  updateSupplier: (id: string, updates: Partial<Supplier>) => void
  deleteSupplier: (id: string) => void
}

const mockSuppliers: Supplier[] = [
  {
    id: 'sup1',
    name: 'NutriMed Hospitalar',
    contact: '(11) 98765-4321',
    email: 'vendas@nutrimed.com.br',
  },
  {
    id: 'sup2',
    name: 'FarmaLact Distribuidora',
    contact: '(14) 3811-0000',
    email: 'contato@farmalact.com',
  },
]

const SupplierContext = createContext<SupplierContextType | undefined>(
  undefined,
)

export function SupplierProvider({ children }: { children: ReactNode }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers)

  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    setSuppliers((prev) => [...prev, { ...supplier, id: crypto.randomUUID() }])
  }

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    )
  }

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id))
  }

  return React.createElement(
    SupplierContext.Provider,
    { value: { suppliers, addSupplier, updateSupplier, deleteSupplier } },
    children,
  )
}

export function useSuppliers() {
  const context = useContext(SupplierContext)
  if (context === undefined) {
    throw new Error('useSuppliers must be used within a SupplierProvider')
  }
  return context
}
