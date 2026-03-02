import { useState, useMemo } from 'react'
import { useLactary, Template } from '@/contexts/LactaryContext'
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
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Check, Info, Plus, Bookmark, AlertCircle } from 'lucide-react'
import { getLocalYYYYMMDD } from '@/lib/utils'

const PREDEFINED_TIMES = [
  '06:00',
  '08:00',
  '09:00',
  '11:00',
  '12:00',
  '14:00',
  '15:00',
  '17:00',
  '18:00',
  '20:00',
  '21:00',
  '23:00',
  '00:00',
  '03:00',
]

const STANDARD_FORMULAS = [
  {
    id: 'rn',
    name: 'Padrão RN',
    milkType: 'Fórmula Infantil',
    mealDesc: undefined,
  },
  {
    id: 'transicao',
    name: 'Transição 6m',
    milkType: 'Fórmula Infantil',
    mealDesc: 'Papinha de Legumes e Carne',
  },
  {
    id: 'alergia',
    name: 'Alergia (PLV)',
    milkType: 'Fórmula Especial (HA)',
    mealDesc: 'Papinha sem Leite/Derivados',
  },
  {
    id: 'leite-materno',
    name: 'Leite Materno Exclusivo',
    milkType: 'Leite Materno Pasteurizado',
    mealDesc: undefined,
  },
]

const Prescriptions = () => {
  const { patients, addPrescription, addPatient, templates, addTemplate } =
    useLactary()
  const { toast } = useToast()

  const [selectedPatient, setSelectedPatient] = useState<string>('')
  const [type, setType] = useState<'milk' | 'meal'>('milk')
  const [standardFormula, setStandardFormula] = useState<string>('')
  const [volume, setVolume] = useState('100')
  const [milkType, setMilkType] = useState('Fórmula Infantil')
  const [description, setDescription] = useState('')
  const [observations, setObservations] = useState('')
  const [restrictions, setRestrictions] = useState('')

  const [selectedTimes, setSelectedTimes] = useState<string[]>([
    '08:00',
    '11:00',
    '14:00',
    '17:00',
    '20:00',
    '23:00',
  ])

  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false)
  const [patientFormData, setPatientFormData] = useState({
    name: '',
    ward: '',
    bed: '',
    recordId: '',
    birthDate: '',
  })

  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [templateName, setTemplateName] = useState('')

  const patient = useMemo(
    () => patients.find((p) => p.id === selectedPatient),
    [patients, selectedPatient],
  )

  const currentStandard = useMemo(
    () => STANDARD_FORMULAS.find((f) => f.id === standardFormula),
    [standardFormula],
  )

  const isMilkDeviated = useMemo(
    () =>
      standardFormula !== '' &&
      currentStandard?.milkType !== undefined &&
      currentStandard.milkType !== milkType,
    [standardFormula, currentStandard, milkType],
  )

  const isMealDeviated = useMemo(
    () =>
      standardFormula !== '' &&
      currentStandard?.mealDesc !== undefined &&
      currentStandard.mealDesc !== description,
    [standardFormula, currentStandard, description],
  )

  const isDeviated = isMilkDeviated || isMealDeviated

  const handleToggleTime = (time: string) => {
    setSelectedTimes((prev) =>
      prev.includes(time)
        ? prev.filter((t) => t !== time)
        : [...prev, time].sort(),
    )
  }

  const handleStandardFormulaChange = (value: string) => {
    setStandardFormula(value)
    if (!value) {
      setMilkType('Fórmula Infantil')
      setDescription('')
      return
    }
    const formula = STANDARD_FORMULAS.find((f) => f.id === value)
    if (formula) {
      if (formula.milkType !== undefined) setMilkType(formula.milkType)
      if (formula.mealDesc !== undefined) setDescription(formula.mealDesc)
    }
  }

  const handleLoadTemplate = (templateId: string) => {
    const t = templates.find((x) => x.id === templateId)
    if (!t) return

    setStandardFormula('')
    setType(t.type)
    if (t.type === 'milk') {
      setMilkType(t.milkType || 'Fórmula Infantil')
      setVolume(t.volume?.toString() || '100')
    } else {
      setDescription(t.description || '')
    }
    setObservations(t.observations || '')
    setRestrictions(t.restrictions || '')
    setSelectedTimes([...t.times])

    toast({
      title: 'Template Carregado',
      description: `Configurações de "${t.name}" aplicadas.`,
    })
  }

  const handleSavePrescription = () => {
    if (!selectedPatient) {
      toast({
        title: 'Erro',
        description: 'Selecione um paciente.',
        variant: 'destructive',
      })
      return
    }

    if (selectedTimes.length === 0) {
      toast({
        title: 'Erro',
        description: 'Selecione ao menos um horário de entrega.',
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
      times: selectedTimes,
      expiryHours: type === 'milk' ? 24 : 6,
      status: 'active',
      date: getLocalYYYYMMDD(new Date()),
    })

    toast({
      title: 'Prescrição Salva',
      description: 'A nova dieta foi registrada com sucesso.',
      action: <Check className="h-4 w-4" />,
    })

    setSelectedPatient('')
    setStandardFormula('')
    setMilkType('Fórmula Infantil')
    setDescription('')
    setObservations('')
    setRestrictions('')
    setSelectedTimes(['08:00', '11:00', '14:00', '17:00', '20:00', '23:00'])
  }

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast({
        title: 'Nome Obrigatório',
        description: 'Dê um nome para o template.',
        variant: 'destructive',
      })
      return
    }

    addTemplate({
      name: templateName,
      type,
      milkType: type === 'milk' ? milkType : undefined,
      volume: type === 'milk' ? Number(volume) : undefined,
      description: type === 'meal' ? description : undefined,
      observations: observations.trim() || undefined,
      restrictions: restrictions.trim() || undefined,
      times: selectedTimes,
      expiryHours: type === 'milk' ? 24 : 6,
    })

    toast({
      title: 'Template Salvo',
      description: 'Agora você pode usar esta configuração rapidamente.',
    })
    setIsTemplateDialogOpen(false)
    setTemplateName('')
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Nova Prescrição</h2>
          <p className="text-muted-foreground mt-1">
            Defina o plano nutricional diário do paciente.
          </p>
        </div>
        <Select onValueChange={handleLoadTemplate}>
          <SelectTrigger className="w-[250px] bg-primary/5 border-primary/20 text-primary font-medium">
            <SelectValue placeholder="Carregar Template..." />
          </SelectTrigger>
          <SelectContent>
            {templates.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">
                Nenhum template salvo.
              </div>
            ) : (
              <SelectGroup>
                <SelectLabel>Meus Templates</SelectLabel>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
          </SelectContent>
        </Select>
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
              <div className="p-4 bg-slate-50 rounded-lg border flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between animate-in fade-in zoom-in-95">
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
          <div className="space-y-4 mb-6 pb-6 border-b">
            <div className="space-y-2">
              <Label className="text-base">
                Fórmula Padrão (Preenchimento Rápido)
              </Label>
              <ToggleGroup
                type="single"
                value={standardFormula}
                onValueChange={handleStandardFormulaChange}
                className="justify-start flex-wrap gap-2"
              >
                {STANDARD_FORMULAS.map((f) => (
                  <ToggleGroupItem
                    key={f.id}
                    value={f.id}
                    variant="outline"
                    className="data-[state=on]:bg-primary/10 data-[state=on]:text-primary data-[state=on]:border-primary/40 data-[state=on]:font-medium transition-all"
                  >
                    {f.name}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <p className="text-xs text-muted-foreground">
                Selecione uma fórmula para preencher automaticamente os campos
                de prescrição.
              </p>
            </div>

            {isDeviated && (
              <Alert className="bg-amber-50 border-amber-200 text-amber-800 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800 font-semibold">
                  Seleção Modificada
                </AlertTitle>
                <AlertDescription className="text-amber-700">
                  Você alterou manualmente as configurações que diferem da
                  fórmula padrão selecionada.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Tabs
            value={type}
            onValueChange={(v) => setType(v as 'milk' | 'meal')}
          >
            <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
              <TabsTrigger value="milk" className="text-base h-full">
                Frasco de Leite
              </TabsTrigger>
              <TabsTrigger value="meal" className="text-base h-full">
                Refeição (Sólida/Pastosa)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="milk" className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 h-6">
                    <Label>Tipo de Leite</Label>
                    {isMilkDeviated ? (
                      <Badge
                        variant="outline"
                        className="text-amber-600 border-amber-200 bg-amber-50 text-[10px] h-5 px-1.5 font-semibold"
                      >
                        Modificado
                      </Badge>
                    ) : standardFormula &&
                      currentStandard?.milkType !== undefined ? (
                      <Badge
                        variant="outline"
                        className="text-emerald-600 border-emerald-200 bg-emerald-50 text-[10px] h-5 px-1.5 flex items-center font-semibold"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Sincronizado
                      </Badge>
                    ) : null}
                  </div>
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
                  <div className="flex items-center gap-2 h-6">
                    <Label>Volume (ml) por horário</Label>
                  </div>
                  <Input
                    type="number"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    className="bg-white"
                    min="1"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="meal" className="space-y-4 animate-in fade-in">
              <div className="space-y-2">
                <div className="flex items-center gap-2 h-6">
                  <Label>Descrição da Refeição</Label>
                  {isMealDeviated ? (
                    <Badge
                      variant="outline"
                      className="text-amber-600 border-amber-200 bg-amber-50 text-[10px] h-5 px-1.5 font-semibold"
                    >
                      Modificado
                    </Badge>
                  ) : standardFormula &&
                    currentStandard?.mealDesc !== undefined ? (
                    <Badge
                      variant="outline"
                      className="text-emerald-600 border-emerald-200 bg-emerald-50 text-[10px] h-5 px-1.5 flex items-center font-semibold"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Sincronizado
                    </Badge>
                  ) : null}
                </div>
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
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4 pt-6 border-t">
              <Label>Horários de Entrega</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
                {PREDEFINED_TIMES.map((time) => (
                  <div key={time} className="flex items-center space-x-2">
                    <Checkbox
                      id={`time-${time}`}
                      checked={selectedTimes.includes(time)}
                      onCheckedChange={() => handleToggleTime(time)}
                    />
                    <label
                      htmlFor={`time-${time}`}
                      className="text-sm font-medium leading-none cursor-pointer select-none"
                    >
                      {time}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center bg-slate-50 p-4 border rounded-lg shadow-sm">
        <Button
          variant="ghost"
          onClick={() => setIsTemplateDialogOpen(true)}
          className="gap-2 text-primary font-medium"
        >
          <Bookmark className="h-4 w-4" />
          Salvar como Template
        </Button>
        <div className="flex gap-4">
          <Button variant="outline">Cancelar</Button>
          <Button
            onClick={handleSavePrescription}
            className="px-8 font-semibold"
          >
            Salvar Prescrição
          </Button>
        </div>
      </div>

      <Dialog
        open={isTemplateDialogOpen}
        onOpenChange={setIsTemplateDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Salvar Template</DialogTitle>
            <DialogDescription>
              Dê um nome para esta configuração. Ela ficará disponível para uso
              rápido.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Nome do Template</Label>
              <Input
                placeholder="Ex: Dieta Padrão 100ml 3/3h"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTemplateDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveTemplate}>Salvar Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
