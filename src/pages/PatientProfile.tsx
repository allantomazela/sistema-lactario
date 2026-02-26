import { useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useLactary } from '@/contexts/LactaryContext'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  ArrowLeft,
  User,
  Activity,
  AlertTriangle,
  Calendar,
  MapPin,
  Hash,
  Info,
  Milk,
  Utensils,
  Clock,
  Printer,
  Edit,
  Trash2,
  Save,
  X,
} from 'lucide-react'

const PatientProfile = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { getPatient, prescriptions, updatePatient, deletePatient } =
    useLactary()

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    bed: '',
    observations: '',
    restrictions: '',
  })

  const patient = useMemo(() => {
    return id ? getPatient(id) : undefined
  }, [id, getPatient, isEditing])

  const patientPrescriptions = useMemo(() => {
    if (!id) return []
    return prescriptions
      .filter((p) => p.patientId === id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [id, prescriptions])

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 animate-fade-in">
        <User className="h-12 w-12 text-muted-foreground opacity-20" />
        <h2 className="text-xl font-medium text-slate-800">
          Paciente não encontrado
        </h2>
        <Button asChild variant="outline">
          <Link to="/pacientes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a lista
          </Link>
        </Button>
      </div>
    )
  }

  const birthDateStr = patient.birthDate
    ? patient.birthDate.split('-').reverse().join('/')
    : 'Não informado'

  const handleEditClick = () => {
    setEditForm({
      name: patient.name,
      bed: patient.bed,
      observations: patient.observations || '',
      restrictions: patient.restrictions || '',
    })
    setIsEditing(true)
  }

  const handleSave = () => {
    if (!editForm.name.trim() || !editForm.bed.trim()) {
      toast({
        title: 'Campos Obrigatórios',
        description: 'Nome e Leito não podem ficar em branco.',
        variant: 'destructive',
      })
      return
    }
    updatePatient(patient.id, {
      name: editForm.name.toUpperCase(),
      bed: editForm.bed,
      observations: editForm.observations,
      restrictions: editForm.restrictions,
    })
    setIsEditing(false)
    toast({
      title: 'Sucesso',
      description: 'Dados do paciente atualizados com sucesso.',
    })
  }

  const handleDelete = () => {
    deletePatient(patient.id)
    toast({
      title: 'Paciente Excluído',
      description: 'O registro do paciente foi removido.',
    })
    navigate('/pacientes', { replace: true })
  }

  return (
    <div className="space-y-6 animate-slide-up max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="shrink-0">
            <Link to="/pacientes">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Voltar</span>
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-800">
              Perfil do Paciente
            </h2>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              Registro detalhado e histórico de prescrições do lactário.
            </p>
          </div>
        </div>
        {!isEditing && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              onClick={handleEditClick}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Excluir Paciente
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir permanentemente?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Você tem certeza que deseja excluir o registro de{' '}
                    <strong>{patient.name}</strong>? Esta ação não pode ser
                    desfeita e removerá o paciente da lista ativa.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Sim, Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {isEditing ? (
        <Card className="shadow-sm border-t-4 border-t-primary animate-fade-in">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              Editar Dados do Paciente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome do Paciente *</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-bed" className="text-primary font-bold">
                  Leito (Localização) *
                </Label>
                <Input
                  id="edit-bed"
                  value={editForm.bed}
                  onChange={(e) =>
                    setEditForm({ ...editForm, bed: e.target.value })
                  }
                  className="border-primary/50 focus-visible:ring-primary bg-primary/5"
                  placeholder="Ex: 12A"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="edit-restrictions">Restrições / Alergias</Label>
                <Textarea
                  id="edit-restrictions"
                  value={editForm.restrictions}
                  onChange={(e) =>
                    setEditForm({ ...editForm, restrictions: e.target.value })
                  }
                  rows={3}
                  className="bg-slate-50 resize-none"
                  placeholder="Ex: APLV, intolerância a lactose..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-obs">Observações Adicionais</Label>
                <Textarea
                  id="edit-obs"
                  value={editForm.observations}
                  onChange={(e) =>
                    setEditForm({ ...editForm, observations: e.target.value })
                  }
                  rows={3}
                  className="bg-slate-50 resize-none"
                  placeholder="Informações clínicas relevantes para o lactário..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="gap-2"
              >
                <X className="h-4 w-4" /> Cancelar
              </Button>
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" /> Salvar Alterações
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 shadow-sm border-t-4 border-t-primary">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  {patient.name}
                </CardTitle>
                {patient.active ? (
                  <Badge className="bg-success text-white">Ativo</Badge>
                ) : (
                  <Badge variant="secondary">Inativo</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-slate-100 rounded-md">
                    <Hash className="h-4 w-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                      Prontuário
                    </p>
                    <p className="font-medium text-slate-900">
                      {patient.recordId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-slate-100 rounded-md">
                    <Calendar className="h-4 w-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                      Data de Nascimento
                    </p>
                    <p className="font-medium text-slate-900">{birthDateStr}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-slate-100 rounded-md">
                    <MapPin className="h-4 w-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                      Localização (Ala / Leito)
                    </p>
                    <p className="font-medium text-slate-900">
                      {patient.ward} - Leito {patient.bed}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-slate-100 rounded-md">
                    <Activity className="h-4 w-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                      Dieta Atual Padrão
                    </p>
                    <p className="font-medium text-slate-900">
                      {patient.dietType}
                    </p>
                  </div>
                </div>
              </div>

              {patient.observations && (
                <div className="mt-2 pt-4 border-t border-slate-100 flex items-start gap-3 text-sm col-span-full">
                  <div className="p-2 bg-slate-100 rounded-md shrink-0">
                    <Info className="h-4 w-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                      Observações
                    </p>
                    <p className="font-medium text-slate-900 mt-1 whitespace-pre-wrap">
                      {patient.observations}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-t-4 border-t-destructive">
            <CardHeader className="pb-4 bg-rose-50/30">
              <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Restrições e Alergias
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {patient.allergies.length > 0 || patient.restrictions ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-muted-foreground">
                    Atenção rigorosa aos seguintes itens informados:
                  </p>
                  {patient.allergies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {patient.allergies.map((allergy, idx) => (
                        <Badge
                          key={idx}
                          variant="destructive"
                          className="px-3 py-1 text-sm font-semibold shadow-sm"
                        >
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {patient.restrictions && (
                    <p className="font-medium text-slate-800 text-sm mt-1 p-3 bg-white rounded-md border border-rose-100 whitespace-pre-wrap">
                      {patient.restrictions}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-6 space-y-2">
                  <Info className="h-8 w-8 text-muted-foreground opacity-20" />
                  <p className="text-sm text-muted-foreground font-medium">
                    Nenhuma alergia ou restrição crítica registrada.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-lg flex items-center gap-2">
            <Printer className="h-5 w-5 text-muted-foreground" />
            Histórico de Prescrições (Lactário)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="w-[120px]">Data</TableHead>
                  <TableHead className="w-[250px]">Dieta / Preparo</TableHead>
                  <TableHead className="min-w-[200px]">Horários</TableHead>
                  <TableHead className="w-[250px]">Observações</TableHead>
                  <TableHead className="text-center w-[120px]">
                    Etiquetas
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patientPrescriptions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-12 text-muted-foreground"
                    >
                      <p className="text-sm">
                        Nenhuma prescrição encontrada para este paciente.
                      </p>
                      <Button
                        variant="link"
                        asChild
                        className="mt-2 text-primary"
                      >
                        <Link to="/prescricoes">Criar Nova Prescrição</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  patientPrescriptions.map((prescription) => (
                    <TableRow key={prescription.id}>
                      <TableCell className="font-medium text-slate-600">
                        {prescription.date.split('-').reverse().join('/')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          {prescription.type === 'milk' ? (
                            <Milk className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                          ) : (
                            <Utensils className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                          )}
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800 leading-tight">
                              {prescription.type === 'milk'
                                ? prescription.milkType
                                : prescription.description}
                            </span>
                            {prescription.type === 'milk' && (
                              <span className="text-xs text-muted-foreground mt-0.5">
                                Vol: {prescription.volume}ml
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-sm text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                            {prescription.times.join(', ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {prescription.restrictions && (
                            <span className="text-xs font-semibold text-destructive flex items-start gap-1">
                              <span className="shrink-0">•</span>
                              {prescription.restrictions}
                            </span>
                          )}
                          {prescription.observations && (
                            <span className="text-xs text-muted-foreground flex items-start gap-1">
                              <span className="shrink-0">•</span>
                              {prescription.observations}
                            </span>
                          )}
                          {!prescription.restrictions &&
                            !prescription.observations && (
                              <span className="text-xs text-muted-foreground italic">
                                Sem observações adicionais.
                              </span>
                            )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className="font-bold bg-slate-50"
                        >
                          {prescription.times.length} unid.
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PatientProfile
