import { useState } from 'react'
import { useLactary, Patient } from '@/contexts/LactaryContext'
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
import { Search, Plus, Upload } from 'lucide-react'
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
  const { patients, addPatient, addPatients } = useLactary()
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

  const [isImportOpen, setIsImportOpen] = useState(false)
  const [importStep, setImportStep] = useState<
    'upload' | 'loading' | 'preview'
  >('upload')
  const [importData, setImportData] = useState<Patient[]>([])
  const [importFile, setImportFile] = useState<File | null>(null)

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
      id: crypto.randomUUID(),
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['xls', 'xlsx', 'mdb', 'accdb', 'xml'].includes(ext || '')) {
      toast({
        title: 'Formato Inválido',
        description: 'Por favor, envie um arquivo Excel, Access ou XML.',
        variant: 'destructive',
      })
      return
    }

    setImportFile(file)
    setImportStep('loading')

    setTimeout(() => {
      const mockData: Patient[] = [
        {
          id: crypto.randomUUID(),
          name: 'MARIA CLARA ALVES',
          ward: 'Pediatria',
          bed: '14B',
          recordId: `REC-${Math.floor(2000 + Math.random() * 1000)}`,
          dietType: 'A Definir',
          allergies: [],
          active: true,
          birthDate: '2023-01-15',
        },
        {
          id: crypto.randomUUID(),
          name: 'JOÃO PEDRO SOUZA',
          ward: 'UTI Neonatal',
          bed: '02A',
          recordId: `REC-${Math.floor(2000 + Math.random() * 1000)}`,
          dietType: 'A Definir',
          allergies: ['Amendoim'],
          active: true,
          birthDate: '2024-02-10',
        },
      ]
      setImportData(mockData)
      setImportStep('preview')
    }, 1500)
  }

  const confirmImport = () => {
    const newPatients = importData.filter(
      (newP) => !patients.some((p) => p.recordId === newP.recordId),
    )
    const duplicates = importData.length - newPatients.length

    if (newPatients.length > 0) {
      addPatients(newPatients)
    }

    toast({
      title: 'Importação Concluída',
      description: `${newPatients.length} pacientes importados. ${
        duplicates > 0 ? `${duplicates} duplicatas ignoradas.` : ''
      }`,
    })

    setIsImportOpen(false)
    setTimeout(() => {
      setImportStep('upload')
      setImportData([])
      setImportFile(null)
    }, 300)
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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setIsImportOpen(true)}
          >
            <Upload className="h-4 w-4" />
            Importar Dados
          </Button>
          <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo Paciente
          </Button>
        </div>
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

      <Dialog
        open={isImportOpen}
        onOpenChange={(open) => {
          setIsImportOpen(open)
          if (!open) {
            setTimeout(() => {
              setImportStep('upload')
              setImportData([])
              setImportFile(null)
            }, 300)
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Importar Pacientes</DialogTitle>
          </DialogHeader>

          {importStep === 'upload' && (
            <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  Clique ou arraste um arquivo para importar
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos suportados: .xls, .xlsx, .xml, .mdb, .accdb
                </p>
              </div>
              <Input
                type="file"
                className="hidden"
                id="file-upload"
                accept=".xls,.xlsx,.xml,.mdb,.accdb"
                onChange={handleFileUpload}
              />
              <Button asChild variant="secondary">
                <label htmlFor="file-upload" className="cursor-pointer">
                  Selecionar Arquivo
                </label>
              </Button>
            </div>
          )}

          {importStep === 'loading' && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">
                Analisando e validando dados...
              </p>
            </div>
          )}

          {importStep === 'preview' && (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-md flex justify-between items-center">
                <span className="text-sm font-medium">
                  Arquivo: {importFile?.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {importData.length} registros encontrados
                </span>
              </div>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Prontuário</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Ala/Leito</TableHead>
                      <TableHead>Nascimento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importData.map((p) => {
                      const isDuplicate = patients.some(
                        (existing) => existing.recordId === p.recordId,
                      )
                      return (
                        <TableRow
                          key={p.id}
                          className={isDuplicate ? 'opacity-50 bg-red-50' : ''}
                        >
                          <TableCell>{p.recordId}</TableCell>
                          <TableCell className="font-medium">
                            {p.name}
                          </TableCell>
                          <TableCell>
                            {p.ward} - {p.bed}
                          </TableCell>
                          <TableCell>
                            {p.birthDate
                              ? p.birthDate.split('-').reverse().join('/')
                              : '-'}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setImportStep('upload')}
                >
                  Cancelar
                </Button>
                <Button onClick={confirmImport}>Confirmar Importação</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Patients
