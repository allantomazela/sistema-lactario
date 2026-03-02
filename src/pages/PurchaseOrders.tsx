import { useState } from 'react'
import { usePurchaseOrders, POStatus } from '@/contexts/PurchaseOrderContext'
import { useSuppliers } from '@/contexts/SupplierContext'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Calendar as CalendarIcon, Truck } from 'lucide-react'

export default function PurchaseOrders() {
  const { orders, updateOrderStatus } = usePurchaseOrders()
  const { suppliers } = useSuppliers()
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredOrders = orders.filter(
    (o) => statusFilter === 'all' || o.status === statusFilter,
  )

  const getStatusBadge = (status: string) => {
    if (status === 'pending') {
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
          Pendente
        </Badge>
      )
    }
    if (status === 'ordered') {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Pedido Realizado
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
        Recebido
      </Badge>
    )
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Pedidos de Compra
          </h2>
          <p className="text-muted-foreground mt-1">
            Acompanhe as solicitações de reposição de estoque.
          </p>
        </div>
        <div className="w-full sm:w-56">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Filtrar por Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="ordered">Pedidos Realizados</SelectItem>
              <SelectItem value="received">Recebidos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>ID Pedido</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Resumo de Itens</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Alterar Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum pedido de compra encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => {
                  const supplier = suppliers.find(
                    (s) => s.id === order.supplierId,
                  )
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-semibold">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                          {order.id}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          {supplier ? supplier.name : 'Fornecedor Excluído'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          {order.date.split('-').reverse().join('/')}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {order.items.length} item(s) totalizando{' '}
                        {order.items.reduce((acc, i) => acc + i.quantity, 0)}{' '}
                        un.
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={order.status}
                          onValueChange={(v) =>
                            updateOrderStatus(order.id, v as POStatus)
                          }
                        >
                          <SelectTrigger className="w-[150px] ml-auto h-8 text-xs font-medium bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">
                              Marcar Pendente
                            </SelectItem>
                            <SelectItem value="ordered">
                              Marcar Realizado
                            </SelectItem>
                            <SelectItem value="received">
                              Marcar Recebido
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
