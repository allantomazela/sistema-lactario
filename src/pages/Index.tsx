import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLactary } from '@/contexts/LactaryContext'
import { Baby, Clock, Printer, AlertTriangle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

const Index = () => {
  const { patients, prescriptions } = useLactary()

  const activePatients = patients.filter((p) => p.active).length
  const totalPrescriptions = prescriptions.length

  // Mock data for dashboard logic
  const nextTimeSlot = '11:00'
  const labelsToPrint = 15

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">
          Visão Geral
        </h2>
        <p className="text-muted-foreground mt-1">
          Status atual do lactário e preparos do dia.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Crianças Ativas
            </CardTitle>
            <Baby className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePatients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registradas no sistema
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Etiquetas Pendentes
            </CardTitle>
            <Printer className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{labelsToPrint}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Para o próximo horário ({nextTimeSlot})
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Preparações Hoje
            </CardTitle>
            <Clock className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de frascos/refeições
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Alertas Ativos
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground mt-1">
              Atenção a alergias (PLV)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Cronograma do Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { time: '08:00', status: 'Concluído', count: 12 },
                {
                  time: '11:00',
                  status: 'Em Preparo',
                  count: 15,
                  current: true,
                },
                { time: '14:00', status: 'Aguardando', count: 14 },
                { time: '17:00', status: 'Aguardando', count: 12 },
              ].map((slot, i) => (
                <div key={i} className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-4 ${slot.current ? 'bg-primary ring-4 ring-primary/20' : slot.status === 'Concluído' ? 'bg-success' : 'bg-muted-foreground/30'}`}
                  />
                  <div className="flex-1">
                    <p
                      className={`font-medium ${slot.current ? 'text-primary' : ''}`}
                    >
                      {slot.time}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {slot.count} preparações
                    </p>
                  </div>
                  <div className="text-sm font-medium">{slot.status}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-slate-50 border-dashed">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="p-4 bg-white rounded-lg border shadow-sm flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-800">
                  Próximo Lote: 11:00
                </h4>
                <p className="text-sm text-muted-foreground">
                  15 etiquetas pendentes para impressão.
                </p>
              </div>
              <Link to="/etiquetas">
                <Button className="gap-2">
                  <Printer className="h-4 w-4" />
                  Imprimir Lote
                </Button>
              </Link>
            </div>

            <div className="p-4 bg-white rounded-lg border shadow-sm flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-800">
                  Nova Prescrição
                </h4>
                <p className="text-sm text-muted-foreground">
                  Registrar dieta de novo paciente.
                </p>
              </div>
              <Link to="/prescricoes">
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Registrar
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Index
