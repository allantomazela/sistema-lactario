import { useState } from 'react'
import { useSuppliers, Supplier } from '@/contexts/SupplierContext'
import { Card, CardContent } from '@/components/ui/card'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Search, Truck } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Suppliers() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } =
    useSuppliers()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Supplier | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
  })

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleOpenDialog = (item?: Supplier) => {
    if (item) {
      setEditingItem(item)
      setFormData({ name: item.name, contact: item.contact, email: item.email })
    } else {
      setEditingItem(null)
      setFormData({ name: '', contact: '', email: '' })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.name) {
      toast({
        title: 'Campo obrigatório',
        description: 'O nome do fornecedor é obrigatório.',
        variant: 'destructive',
      })
      return
    }

    if (editingItem) {
      updateSupplier(editingItem.id, formData)
      toast({ title: 'Fornecedor atualizado com sucesso' })
    } else {
      addSupplier(formData)
      toast({ title: 'Fornecedor cadastrado com sucesso' })
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    deleteSupplier(id)
    toast({ title: 'Fornecedor removido do sistema' })
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Fornecedores</h2>
          <p className="text-muted-foreground mt-1">
            Gerencie os parceiros e fornecedores do lactário.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Fornecedor
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b flex items-center gap-4 bg-slate-50/50 rounded-t-xl">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar fornecedor..."
                className="pl-9 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead>Nome do Fornecedor</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum fornecedor encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      {supplier.name}
                    </TableCell>
                    <TableCell>{supplier.contact || '-'}</TableCell>
                    <TableCell>{supplier.email || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(supplier)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(supplier.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Fornecedor' : 'Novo Fornecedor'}
            </DialogTitle>
            <DialogDescription>
              Cadastre as informações de contato para gerar listas de compras
              facilmente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nome da Empresa *</Label>
              <Input
                placeholder="Razão Social ou Nome Fantasia"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone / Contato</Label>
              <Input
                placeholder="(00) 00000-0000"
                value={formData.contact}
                onChange={(e) =>
                  setFormData({ ...formData, contact: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail Corporativo</Label>
              <Input
                type="email"
                placeholder="vendas@fornecedor.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar Fornecedor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
