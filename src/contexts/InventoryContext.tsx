import React, { createContext, useContext, useState, ReactNode } from 'react'

export type InventoryItem = {
  id: string
  name: string
  quantity: number
  minLevel: number
  unit: string
  batch?: string
  expirationDate?: string
  supplierId?: string
}

interface InventoryContextType {
  items: InventoryItem[]
  addItem: (item: Omit<InventoryItem, 'id'>) => void
  updateItem: (id: string, updates: Partial<InventoryItem>) => void
  deleteItem: (id: string) => void
}

const offsetDays = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

const mockItems: InventoryItem[] = [
  {
    id: 'i1',
    name: 'Fórmula Infantil Padrão',
    quantity: 5,
    minLevel: 10,
    unit: 'latas',
    batch: 'LT2024-001',
    expirationDate: offsetDays(5),
    supplierId: 'sup1',
  },
  {
    id: 'i2',
    name: 'Fórmula Especial HA',
    quantity: 15,
    minLevel: 5,
    unit: 'latas',
    batch: 'LT2023-099',
    expirationDate: offsetDays(-2),
    supplierId: 'sup2',
  },
  {
    id: 'i3',
    name: 'Espessante Alimentar',
    quantity: 2,
    minLevel: 5,
    unit: 'unid',
    batch: 'ESP-123',
    expirationDate: offsetDays(365),
  },
  {
    id: 'i4',
    name: 'Frascos Estéreis 100ml',
    quantity: 120,
    minLevel: 50,
    unit: 'unid',
    supplierId: 'sup1',
  },
  {
    id: 'i5',
    name: 'Leite Materno Pasteurizado',
    quantity: 8,
    minLevel: 15,
    unit: 'frascos',
    batch: 'LMP-042',
    expirationDate: offsetDays(1),
  },
]

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined,
)

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>(mockItems)

  const addItem = (item: Omit<InventoryItem, 'id'>) => {
    setItems((prev) => [...prev, { ...item, id: crypto.randomUUID() }])
  }

  const updateItem = (id: string, updates: Partial<InventoryItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    )
  }

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  return React.createElement(
    InventoryContext.Provider,
    {
      value: {
        items,
        addItem,
        updateItem,
        deleteItem,
      },
    },
    children,
  )
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider')
  }
  return context
}
