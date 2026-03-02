import { useState } from 'react'
import { useInventory, InventoryItem } from '@/contexts/InventoryContext'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  Edit,
  Trash2,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Inventory() {
  const { items, addItem, updateItem, deleteItem } = useInventory()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    minLevel: '',
    unit: 'unid',
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
      })
    } else {
      setEditingItem(null)
      setFormData({ name: '', quantity: '', minLevel: '', unit: 'unid' })
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

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Estoque de Insumos
          </h2>
          <p className="text-muted-foreground mt-1">
            Monitore os níveis de fórmulas, suplementos e frascos.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Item
        </Button>
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
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum item encontrado no estoque.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.quantity <= item.minLevel
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        {item.name}
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
                        {isLow ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Estoque Baixo
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-success/10 text-success hover:bg-success/20"
                          >
                            Adequado
                          </Badge>
                        )}
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Item' : 'Novo Item'}
            </DialogTitle>
            <DialogDescription>
              Configure os níveis de alerta para ser avisado quando o estoque
              estiver baixo.
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
            <div className="space-y-2">
              <Label className="text-amber-600 font-semibold">
                Nível Mínimo (Alerta)
              </Label>
              <Input
                type="number"
                min="0"
                value={formData.minLevel}
                onChange={(e) =>
                  setFormData({ ...formData, minLevel: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                O sistema avisará quando a quantidade atingir este valor ou for
                menor.
              </p>
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
    </div>
  )
}
