import { useState } from 'react'
import { useLactary } from '@/contexts/LactaryContext'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

const Patients = () => {
  const { patients, addPatient } = useLactary()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    ward: '',
    bed: '',
    recordId: '',
    birthDate: '',
  })

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.recordId.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleOpenChange = (open: boolean) => {
    setIsAddOpen(open)
    if (!open)
      setFormData({ name: '', ward: '', bed: '', recordId: '', birthDate: '' })
  }

  const handleSave = () => {
    if (
      !formData.name.trim() ||
      !formData.ward.trim() ||
      !formData.bed.trim()
    ) {
      toast({
        title: 'Campos Obrigatórios',
        description:
          'Nome, Ala/Quarto e Leito são obrigatórios para o cadastro.',
        variant: 'destructive',
      })
      return
    }

    addPatient({
      name: formData.name.toUpperCase(),
      ward: formData.ward,
      bed: formData.bed,
      recordId:
        formData.recordId || `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      birthDate: formData.birthDate,
      dietType: 'A Definir',
      allergies: [],
      active: true,
    })

    toast({ title: 'Sucesso', description: 'Paciente registrado com sucesso.' })
    handleOpenChange(false)
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pacientes</h2>
          <p className="text-muted-foreground mt-1">
            Gerencie os registros das crianças internadas.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo Paciente
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b flex items-center gap-4 bg-slate-50/50 rounded-t-xl">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou registro..."
                className="pl-9 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead>Registro</TableHead>
                <TableHead>Nome da Criança</TableHead>
                <TableHead>Ala / Leito</TableHead>
                <TableHead>Dieta Atual</TableHead>
                <TableHead>Alergias / Restrições</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum paciente encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => (
                  <TableRow
                    key={patient.id}
                    className="cursor-pointer transition-colors hover:bg-slate-50"
                  >
                    <TableCell className="font-medium text-slate-600">
                      {patient.recordId}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">
                          {patient.name}
                        </span>
                        {patient.birthDate && (
                          <span className="text-xs text-muted-foreground">
                            Nasc:{' '}
                            {patient.birthDate.split('-').reverse().join('/')}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {patient.ward}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Leito {patient.bed}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{patient.dietType}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {patient.allergies.length > 0 ? (
                          patient.allergies.map((allergy) => (
                            <Badge
                              key={allergy}
                              variant="destructive"
                              className="font-semibold px-2 py-0.5 shadow-sm"
                            >
                              {allergy}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Nenhuma
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Ver Perfil
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Registrar Novo Paciente</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Paciente *</Label>
              <Input
                id="name"
                placeholder="Nome completo da criança"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ward">Ala / Quarto *</Label>
                <Input
                  id="ward"
                  placeholder="Ex: Pediatria"
                  value={formData.ward}
                  onChange={(e) =>
                    setFormData({ ...formData, ward: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bed">Leito *</Label>
                <Input
                  id="bed"
                  placeholder="Ex: 12A"
                  value={formData.bed}
                  onChange={(e) =>
                    setFormData({ ...formData, bed: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recordId">Prontuário / ID</Label>
                <Input
                  id="recordId"
                  placeholder="Opcional"
                  value={formData.recordId}
                  onChange={(e) =>
                    setFormData({ ...formData, recordId: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) =>
                    setFormData({ ...formData, birthDate: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar Paciente</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Patients
