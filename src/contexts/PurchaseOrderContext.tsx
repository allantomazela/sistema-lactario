import React, { createContext, useContext, useState, ReactNode } from 'react'

export type POStatus = 'pending' | 'ordered' | 'received'

export type POItem = {
  itemId: string
  name: string
  quantity: number
  unit: string
}

export type PurchaseOrder = {
  id: string
  supplierId: string
  date: string
  items: POItem[]
  status: POStatus
}

interface PurchaseOrderContextType {
  orders: PurchaseOrder[]
  addOrders: (orders: Omit<PurchaseOrder, 'id'>[]) => void
  updateOrderStatus: (id: string, status: POStatus) => void
}

const mockOrders: PurchaseOrder[] = [
  {
    id: 'PO-1001',
    supplierId: 'sup1',
    date: '2024-03-01',
    status: 'received',
    items: [
      {
        itemId: 'i1',
        name: 'Fórmula Infantil Padrão',
        quantity: 20,
        unit: 'latas',
      },
    ],
  },
  {
    id: 'PO-1002',
    supplierId: 'sup2',
    date: '2024-03-10',
    status: 'ordered',
    items: [
      {
        itemId: 'i2',
        name: 'Fórmula Especial HA',
        quantity: 10,
        unit: 'latas',
      },
    ],
  },
]

const PurchaseOrderContext = createContext<
  PurchaseOrderContextType | undefined
>(undefined)

export function PurchaseOrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<PurchaseOrder[]>(mockOrders)

  const addOrders = (newOrders: Omit<PurchaseOrder, 'id'>[]) => {
    const ordersWithId = newOrders.map((o) => ({
      ...o,
      id: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
    }))
    setOrders((prev) => [...ordersWithId, ...prev])
  }

  const updateOrderStatus = (id: string, status: POStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
  }

  return React.createElement(
    PurchaseOrderContext.Provider,
    { value: { orders, addOrders, updateOrderStatus } },
    children,
  )
}

export function usePurchaseOrders() {
  const context = useContext(PurchaseOrderContext)
  if (context === undefined) {
    throw new Error(
      'usePurchaseOrders must be used within a PurchaseOrderProvider',
    )
  }
  return context
}
