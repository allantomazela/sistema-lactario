import { useState } from 'react'
import { useLactary } from '@/contexts/LactaryContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Check, Info, Plus } from 'lucide-react'

const Prescriptions = () => {
  const { patients, addPrescription, addPatient } = useLactary()
  const { toast } = useToast()

  const [selectedPatient, setSelectedPatient] = useState<string>('')
  const [type, setType] = useState<'milk' | 'meal'>('milk')
  const [volume, setVolume] = useState('100')
  const [milkType, setMilkType] = useState('Fórmula Infantil')
  const [description, setDescription] = useState('')
  const [observations, setObservations] = useState('')
  const [restrictions, setRestrictions] = useState('')
  const [times, setTimes] = useState('08:00, 11:00, 14:00, 17:00, 20:00, 23:00')

  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false)
  const [patientFormData, setPatientFormData] = useState({
    name: '',
    ward: '',
    bed: '',
    recordId: '',
    birthDate: '',
  })

  const patient = patients.find((p) => p.id === selectedPatient)

  const handleSavePrescription = () => {
    if (!selectedPatient) {
      toast({
        title: 'Erro',
        description: 'Selecione um paciente.',
        variant: 'destructive',
      })
      return
    }

    addPrescription({
      patientId: selectedPatient,
      type,
      milkType: type === 'milk' ? milkType : undefined,
      volume: type === 'milk' ? Number(volume) : undefined,
      description: type === 'meal' ? description : undefined,
      observations: observations.trim() || undefined,
      restrictions: restrictions.trim() || undefined,
      times: times.split(',').map((t) => t.trim()),
      expiryHours: type === 'milk' ? 24 : 6,
      status: 'active',
    })

    toast({
      title: 'Prescrição Salva',
      description: 'A nova dieta foi registrada com sucesso.',
      action: <Check className="h-4 w-4" />,
    })

    setSelectedPatient('')
    setObservations('')
    setRestrictions('')
  }

  const handleSavePatient = () => {
    if (
      !patientFormData.name.trim() ||
      !patientFormData.ward.trim() ||
      !patientFormData.bed.trim()
    ) {
      toast({
        title: 'Campos Obrigatórios',
        description: 'Nome, Ala/Quarto e Leito são obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    const newId = crypto.randomUUID()
    addPatient({
      id: newId,
      name: patientFormData.name.toUpperCase(),
      ward: patientFormData.ward,
      bed: patientFormData.bed,
      recordId:
        patientFormData.recordId ||
        `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      birthDate: patientFormData.birthDate,
      dietType: 'A Definir',
      allergies: [],
      active: true,
    })

    toast({
      title: 'Sucesso',
      description: 'Paciente registrado e selecionado.',
    })
    setSelectedPatient(newId)
    setIsAddPatientOpen(false)
    setPatientFormData({
      name: '',
      ward: '',
      bed: '',
      recordId: '',
      birthDate: '',
    })
  }

  return (
    <div className="space-y-6 animate-slide-up max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Nova Prescrição</h2>
        <p className="text-muted-foreground mt-1">
          Defina o plano nutricional diário do paciente.
        </p>
      </div>

      <Card className="shadow-md border-t-4 border-t-primary">
        <CardHeader className="bg-slate-50/50 rounded-t-xl border-b">
          <CardTitle>Identificação</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Selecionar Paciente</Label>
              <div className="flex gap-2">
                <Select
                  value={selectedPatient}
                  onValueChange={setSelectedPatient}
                >
                  <SelectTrigger className="w-full h-12 bg-white">
                    <SelectValue placeholder="Selecione um paciente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {patients
                      .filter((p) => p.active)
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} - Leito {p.bed}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  className="h-12 w-12 shrink-0"
                  onClick={() => setIsAddPatientOpen(true)}
                  title="Novo Paciente"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {patient && (
              <div className="p-4 bg-slate-50 rounded-lg border flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <p className="font-bold text-lg">{patient.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {patient.ward} - Leito {patient.bed} | Reg:{' '}
                    {patient.recordId}
                  </p>
                </div>
                {patient.allergies.length > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-rose-50 border border-rose-200 rounded-md">
                    <Info className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-semibold text-destructive">
                      Alergias: {patient.allergies.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="bg-slate-50/50 rounded-t-xl border-b">
          <CardTitle>Dieta e Horários</CardTitle>
          <CardDescription>
            Defina o que será preparado no lactário.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs
            value={type}
            onValueChange={(v) => setType(v as 'milk' | 'meal')}
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="milk" className="text-base">
                Frasco de Leite
              </TabsTrigger>
              <TabsTrigger value="meal" className="text-base">
                Refeição (Sólida/Pastosa)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="milk" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Tipo de Leite</Label>
                  <Select value={milkType} onValueChange={setMilkType}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fórmula Infantil">
                        Fórmula Infantil Padrão
                      </SelectItem>
                      <SelectItem value="Leite Materno Pasteurizado">
                        Leite Materno Pasteurizado
                      </SelectItem>
                      <SelectItem value="Leite Materno Cru">
                        Leite Materno Cru
                      </SelectItem>
                      <SelectItem value="Fórmula Especial (HA)">
                        Fórmula Especial (HA)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Volume (ml) por horário</Label>
                  <Input
                    type="number"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    className="bg-white"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="meal" className="space-y-4">
              <div className="space-y-2">
                <Label>Descrição da Refeição</Label>
                <Input
                  placeholder="Ex: Papinha de Legumes com Frango liquidificada"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-white"
                />
                <p className="text-xs text-muted-foreground">
                  Esta descrição será impressa diretamente na etiqueta.
                </p>
              </div>
            </TabsContent>

            <div className="mt-8 space-y-4 pt-6 border-t">
              <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Informações Adicionais (Impressas na Etiqueta)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Restrições</Label>
                  <Textarea
                    placeholder="Ex: Alergia a PLV, Não usar bico ortodôntico..."
                    value={restrictions}
                    onChange={(e) => setRestrictions(e.target.value)}
                    className="bg-white resize-none"
                    rows={2}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Instruções críticas que exigem atenção extra.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    placeholder="Ex: Aquecer a 37°C, Espessante 2g..."
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    className="bg-white resize-none"
                    rows={2}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Instruções de preparo ou administração.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-2 pt-6 border-t">
              <Label>Horários de Administração</Label>
              <Input
                value={times}
                onChange={(e) => setTimes(e.target.value)}
                className="bg-white"
                placeholder="Ex: 08:00, 11:00, 14:00"
              />
              <p className="text-xs text-muted-foreground">
                Separe os horários por vírgula. Uma etiqueta será gerada para
                cada horário na impressão em lote.
              </p>

              <div className="flex flex-wrap gap-2 mt-3">
                {times
                  .split(',')
                  .filter((t) => t.trim())
                  .map((t, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="px-3 py-1 text-sm"
                    >
                      {t.trim()}
                    </Badge>
                  ))}
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline">Cancelar</Button>
        <Button onClick={handleSavePrescription} className="px-8 font-semibold">
          Salvar Prescrição
        </Button>
      </div>

      <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Novo Paciente</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Paciente *</Label>
              <Input
                id="name"
                placeholder="Nome completo da criança"
                value={patientFormData.name}
                onChange={(e) =>
                  setPatientFormData({
                    ...patientFormData,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ward">Ala / Quarto *</Label>
                <Input
                  id="ward"
                  placeholder="Ex: Pediatria"
                  value={patientFormData.ward}
                  onChange={(e) =>
                    setPatientFormData({
                      ...patientFormData,
                      ward: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bed">Leito *</Label>
                <Input
                  id="bed"
                  placeholder="Ex: 12A"
                  value={patientFormData.bed}
                  onChange={(e) =>
                    setPatientFormData({
                      ...patientFormData,
                      bed: e.target.value,
                    })
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
                  value={patientFormData.recordId}
                  onChange={(e) =>
                    setPatientFormData({
                      ...patientFormData,
                      recordId: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={patientFormData.birthDate}
                  onChange={(e) =>
                    setPatientFormData({
                      ...patientFormData,
                      birthDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddPatientOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSavePatient}>Salvar e Selecionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Prescriptions
