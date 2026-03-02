import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLactary } from '@/contexts/LactaryContext'
import { useInventory } from '@/contexts/InventoryContext'
import {
  Baby,
  Clock,
  Printer,
  AlertTriangle,
  FileText,
  Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'

const Index = () => {
  const { patients, prescriptions } = useLactary()
  const { items } = useInventory()

  const activePatients = patients.filter((p) => p.active).length
  const totalPrescriptions = prescriptions.length

  const lowStockItems = items.filter((i) => i.quantity <= i.minLevel)
  const hasLowStock = lowStockItems.length > 0

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

      {hasLowStock && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-start sm:items-center gap-4">
          <div className="bg-rose-100 p-2 rounded-full shrink-0">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="text-rose-800 font-bold">Atenção: Estoque Baixo</h3>
            <p className="text-rose-700 text-sm mt-0.5">
              Existem {lowStockItems.length} insumo(s) que atingiram o nível
              crítico de estoque ({lowStockItems.map((i) => i.name).join(', ')}
              ).
            </p>
          </div>
          <Button
            variant="outline"
            className="border-rose-200 text-rose-700 hover:bg-rose-100 shrink-0"
            asChild
          >
            <Link to="/estoque">Ver Estoque</Link>
          </Button>
        </div>
      )}

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

        <Card
          className={`border-l-4 shadow-sm ${hasLowStock ? 'border-l-destructive' : 'border-l-slate-300'}`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Insumos Monitorados
            </CardTitle>
            <Package
              className={`h-4 w-4 ${hasLowStock ? 'text-destructive' : 'text-slate-400'}`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {hasLowStock ? (
                <span className="text-destructive font-semibold">
                  {lowStockItems.length} em nível crítico
                </span>
              ) : (
                <span>Todos os níveis adequados</span>
              )}
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
