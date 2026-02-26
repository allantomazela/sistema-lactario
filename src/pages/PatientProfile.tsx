import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useLactary } from '@/contexts/LactaryContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
} from 'lucide-react'

const PatientProfile = () => {
  const { id } = useParams<{ id: string }>()
  const { getPatient, prescriptions } = useLactary()

  const patient = useMemo(() => {
    return id ? getPatient(id) : undefined
  }, [id, getPatient])

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

  return (
    <div className="space-y-6 animate-slide-up max-w-6xl mx-auto">
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
            {patient.allergies.length > 0 ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">
                  Atenção rigorosa aos seguintes itens informados no cadastro:
                </p>
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
