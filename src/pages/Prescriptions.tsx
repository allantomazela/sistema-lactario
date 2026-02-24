import { useState } from 'react'
import { useLactary, Patient } from '@/contexts/LactaryContext'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Check, Info } from 'lucide-react'

const Prescriptions = () => {
  const { patients, addPrescription } = useLactary()
  const { toast } = useToast()

  const [selectedPatient, setSelectedPatient] = useState<string>('')
  const [type, setType] = useState<'milk' | 'meal'>('milk')
  const [volume, setVolume] = useState('100')
  const [milkType, setMilkType] = useState('Fórmula Infantil')
  const [description, setDescription] = useState('')
  const [times, setTimes] = useState('08:00, 11:00, 14:00, 17:00, 20:00, 23:00')

  const patient = patients.find((p) => p.id === selectedPatient)

  const handleSave = () => {
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
      times: times.split(',').map((t) => t.trim()),
      expiryHours: type === 'milk' ? 24 : 6,
      status: 'active',
    })

    toast({
      title: 'Prescrição Salva',
      description: 'A nova dieta foi registrada com sucesso.',
      action: <Check className="h-4 w-4" />,
    })

    // Reset form
    setSelectedPatient('')
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
        <Button onClick={handleSave} className="px-8 font-semibold">
          Salvar Prescrição
        </Button>
      </div>
    </div>
  )
}

export default Prescriptions
