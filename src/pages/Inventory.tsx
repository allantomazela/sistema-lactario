import { useState, useMemo } from 'react'
import { useInventory, InventoryItem } from '@/contexts/InventoryContext'
import { useSuppliers } from '@/contexts/SupplierContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  Edit,
  Trash2,
  ShoppingCart,
  Truck,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getLocalYYYYMMDD, cn } from '@/lib/utils'

export default function Inventory() {
  const { items, addItem, updateItem, deleteItem } = useInventory()
  const { suppliers } = useSuppliers()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    minLevel: '',
    unit: 'unid',
    batch: '',
    expirationDate: '',
    supplierId: 'none',
  })

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleOpenDialog = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        name: item.name,
        quantity: item.quantity.toString(),
        minLevel: item.minLevel.toString(),
        unit: item.unit,
        batch: item.batch || '',
        expirationDate: item.expirationDate || '',
        supplierId: item.supplierId || 'none',
      })
    } else {
      setEditingItem(null)
      setFormData({
        name: '',
        quantity: '',
        minLevel: '',
        unit: 'unid',
        batch: '',
        expirationDate: '',
        supplierId: 'none',
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.quantity || !formData.minLevel) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha o nome e as quantidades.',
        variant: 'destructive',
      })
      return
    }

    const payload = {
      name: formData.name,
      quantity: Number(formData.quantity),
      minLevel: Number(formData.minLevel),
      unit: formData.unit,
      batch: formData.batch.trim() || undefined,
      expirationDate: formData.expirationDate || undefined,
      supplierId:
        formData.supplierId === 'none' ? undefined : formData.supplierId,
    }

    if (editingItem) {
      updateItem(editingItem.id, payload)
      toast({ title: 'Item atualizado com sucesso' })
    } else {
      addItem(payload)
      toast({ title: 'Item adicionado ao estoque' })
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    deleteItem(id)
    toast({ title: 'Item removido do estoque' })
  }

  const todayStr = getLocalYYYYMMDD(new Date())

  const shoppingList = useMemo(() => {
    const lowStockItems = items.filter((i) => i.quantity <= i.minLevel)
    return lowStockItems.reduce(
      (acc, item) => {
        const supId = item.supplierId || 'none'
        if (!acc[supId]) acc[supId] = []
        acc[supId].push(item)
        return acc
      },
      {} as Record<string, typeof items>,
    )
  }, [items])

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Estoque de Insumos
          </h2>
          <p className="text-muted-foreground mt-1">
            Monitore lotes, validades e níveis de fórmulas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsShoppingListOpen(true)}
            className="gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Lista de Compras
          </Button>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Item
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b flex items-center gap-4 bg-slate-50/50 rounded-t-xl">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar insumo..."
                className="pl-9 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead>Insumo</TableHead>
                <TableHead>Lote / Validade</TableHead>
                <TableHead className="text-right">Quantidade Atual</TableHead>
                <TableHead className="text-right">Nível Mínimo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum item encontrado no estoque.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.quantity <= item.minLevel
                  const isExpired = item.expirationDate
                    ? item.expirationDate < todayStr
                    : false
                  const isExpiringSoon =
                    item.expirationDate && !isExpired
                      ? (new Date(item.expirationDate).getTime() -
                          new Date(todayStr).getTime()) /
                          (1000 * 3600 * 24) <=
                        7
                      : false

                  return (
                    <TableRow
                      key={item.id}
                      className={cn({
                        'bg-red-50/30 hover:bg-red-50/50': isExpired,
                        'bg-orange-50/30 hover:bg-orange-50/50': isExpiringSoon,
                      })}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                          {item.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {item.batch || '-'}
                        </div>
                        <div
                          className={cn(
                            'text-xs',
                            isExpired
                              ? 'text-red-600 font-bold'
                              : isExpiringSoon
                                ? 'text-orange-600 font-bold'
                                : 'text-muted-foreground',
                          )}
                        >
                          {item.expirationDate
                            ? item.expirationDate.split('-').reverse().join('/')
                            : 'Sem validade'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {item.quantity}{' '}
                        <span className="text-muted-foreground text-xs font-normal">
                          {item.unit}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {item.minLevel} {item.unit}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          {isLow && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" /> Baixo
                            </Badge>
                          )}
                          {isExpired && (
                            <Badge variant="destructive" className="bg-red-600">
                              Vencido
                            </Badge>
                          )}
                          {isExpiringSoon && (
                            <Badge
                              variant="secondary"
                              className="bg-orange-100 text-orange-700"
                            >
                              Vence em{' '}
                              {Math.ceil(
                                (new Date(item.expirationDate!).getTime() -
                                  new Date(todayStr).getTime()) /
                                  (1000 * 3600 * 24),
                              )}{' '}
                              d
                            </Badge>
                          )}
                          {!isLow && !isExpired && !isExpiringSoon && (
                            <Badge
                              variant="secondary"
                              className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            >
                              Adequado
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Item' : 'Novo Item'}
            </DialogTitle>
            <DialogDescription>
              Configure os detalhes e alertas do estoque.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Insumo</Label>
              <Input
                placeholder="Ex: Fórmula HA"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Quantidade Atual</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Unidade</Label>
                <Input
                  placeholder="latas, ml..."
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-amber-600 font-semibold">
                  Nível Mínimo
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.minLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, minLevel: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Lote</Label>
                <Input
                  placeholder="Ex: LT-24"
                  value={formData.batch}
                  onChange={(e) =>
                    setFormData({ ...formData, batch: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Validade</Label>
                <Input
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expirationDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Fornecedor</Label>
                <Select
                  value={formData.supplierId}
                  onValueChange={(val) =>
                    setFormData({ ...formData, supplierId: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isShoppingListOpen} onOpenChange={setIsShoppingListOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lista de Compras (Sugestão)</DialogTitle>
            <DialogDescription>
              Itens que atingiram o estoque mínimo, agrupados por fornecedor.
            </DialogDescription>
          </DialogHeader>
          {Object.keys(shoppingList).length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <ShoppingCart className="h-10 w-10 mx-auto opacity-20 mb-2" />
              Nenhum item abaixo do nível de estoque mínimo.
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {Object.entries(shoppingList).map(([supId, supItems]) => {
                const supplier = suppliers.find((s) => s.id === supId)
                const supplierName = supplier
                  ? supplier.name
                  : 'Sem Fornecedor Vinculado'
                return (
                  <div
                    key={supId}
                    className="border rounded-lg overflow-hidden shadow-sm"
                  >
                    <div className="bg-slate-50 px-4 py-3 border-b flex items-center gap-2">
                      <Truck className="h-5 w-5 text-primary" />
                      <h4 className="font-bold text-slate-800">
                        {supplierName}
                      </h4>
                      {supplier && (
                        <span className="text-xs text-muted-foreground ml-auto">
                          {supplier.contact}
                        </span>
                      )}
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Insumo</TableHead>
                          <TableHead className="text-right">Faltam</TableHead>
                          <TableHead className="text-right">
                            Sugestão de Compra
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {supItems.map((item) => {
                          const shortage = item.minLevel - item.quantity
                          const suggested =
                            shortage > 0
                              ? shortage + Math.ceil(item.minLevel * 0.5)
                              : item.minLevel
                          return (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">
                                {item.name}
                              </TableCell>
                              <TableCell className="text-right text-destructive font-semibold">
                                {shortage} {item.unit}
                              </TableCell>
                              <TableCell className="text-right text-success font-bold">
                                {suggested} {item.unit}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )
              })}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsShoppingListOpen(false)}
            >
              Fechar
            </Button>
            <Button className="gap-2" onClick={() => window.print()}>
              <ShoppingCart className="h-4 w-4" /> Imprimir Lista
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
