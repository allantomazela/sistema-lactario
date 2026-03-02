import { useState, useMemo } from 'react'
import { useLactary } from '@/contexts/LactaryContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Printer, FileText } from 'lucide-react'
import { getLocalYYYYMMDD } from '@/lib/utils'

export default function Reports() {
  const { prescriptions, patients } = useLactary()
  const d = new Date()
  const today = getLocalYYYYMMDD(d)
  const firstDayMonth = getLocalYYYYMMDD(
    new Date(d.getFullYear(), d.getMonth(), 1),
  )
  const lastDayMonth = getLocalYYYYMMDD(
    new Date(d.getFullYear(), d.getMonth() + 1, 0),
  )
  const firstDayYear = getLocalYYYYMMDD(new Date(d.getFullYear(), 0, 1))
  const lastDayYear = getLocalYYYYMMDD(new Date(d.getFullYear(), 11, 31))

  const [preset, setPreset] = useState<'today' | 'month' | 'year' | 'custom'>(
    'month',
  )
  const [start, setStart] = useState(firstDayMonth)
  const [end, setEnd] = useState(lastDayMonth)
  const [patientId, setPatientId] = useState('all')
  const [diet, setDiet] = useState('all')

  const setRange = (p: 'today' | 'month' | 'year', s: string, e: string) => {
    setPreset(p)
    setStart(s)
    setEnd(e)
  }

  const reportData = useMemo(() => {
    return prescriptions
      .filter((p) => p.date >= start && p.date <= end)
      .filter((p) => patientId === 'all' || p.patientId === patientId)
      .filter((p) => diet === 'all' || p.type === diet)
      .map((p) => ({
        ...p,
        patient: patients.find((pat) => pat.id === p.patientId),
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [prescriptions, patients, start, end, patientId, diet])

  const handlePrint = () => window.print()

  return (
    <div className="space-y-6 animate-slide-up" id="print-area">
      <style type="text/css" media="print">{`
        @page { size: A4 portrait; margin: 15mm; }
        body * { visibility: hidden; }
        #print-area, #print-area * { visibility: visible; }
        #print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
        .no-print { display: none !important; }
      `}</style>

      <div className="no-print flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Relatórios de Prescrições
          </h2>
          <p className="text-muted-foreground mt-1">
            Gere e imprima relatórios detalhados de dietas e lactário.
          </p>
        </div>
      </div>

      <div className="hidden print:block mb-8 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-black uppercase tracking-wider text-center">
          Relatório de Prescrições
        </h1>
        <div className="flex justify-between text-sm mt-4 font-medium text-gray-800">
          <span>
            Período: {start.split('-').reverse().join('/')} a{' '}
            {end.split('-').reverse().join('/')}
          </span>
          <span>
            Paciente:{' '}
            {patientId === 'all'
              ? 'Todos'
              : patients.find((p) => p.id === patientId)?.name}
          </span>
          <span>
            Dieta:{' '}
            {diet === 'all'
              ? 'Todas'
              : diet === 'milk'
                ? 'Fórmulas/Leite'
                : 'Refeições'}
          </span>
        </div>
      </div>

      <Card className="no-print bg-slate-50 border-dashed">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5 flex-1 min-w-[200px]">
              <Label>Período Rápido</Label>
              <div className="flex gap-2">
                <Button
                  variant={preset === 'today' ? 'default' : 'outline'}
                  onClick={() => setRange('today', today, today)}
                  size="sm"
                >
                  Hoje
                </Button>
                <Button
                  variant={preset === 'month' ? 'default' : 'outline'}
                  onClick={() => setRange('month', firstDayMonth, lastDayMonth)}
                  size="sm"
                >
                  Este Mês
                </Button>
                <Button
                  variant={preset === 'year' ? 'default' : 'outline'}
                  onClick={() => setRange('year', firstDayYear, lastDayYear)}
                  size="sm"
                >
                  Este Ano
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Data Inicial</Label>
              <Input
                type="date"
                value={start}
                onChange={(e) => {
                  setStart(e.target.value)
                  setPreset('custom')
                }}
                className="h-9 bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Data Final</Label>
              <Input
                type="date"
                value={end}
                onChange={(e) => {
                  setEnd(e.target.value)
                  setPreset('custom')
                }}
                className="h-9 bg-white"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-4 pt-4 border-t">
            <div className="space-y-1.5 flex-1 min-w-[200px]">
              <Label>Filtrar por Paciente</Label>
              <Select value={patientId} onValueChange={setPatientId}>
                <SelectTrigger className="bg-white h-9">
                  <SelectValue placeholder="Todos os pacientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Pacientes</SelectItem>
                  {patients
                    .filter((p) => p.active)
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 flex-1 min-w-[200px]">
              <Label>Tipo de Dieta</Label>
              <Select value={diet} onValueChange={setDiet}>
                <SelectTrigger className="bg-white h-9">
                  <SelectValue placeholder="Todas as dietas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Dietas</SelectItem>
                  <SelectItem value="milk">Fórmulas e Leite Materno</SelectItem>
                  <SelectItem value="meal">
                    Refeições Sólidas/Pastosas
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm print:shadow-none print:border-none">
        <CardHeader className="no-print flex flex-row items-center justify-between py-4 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Resultados da Busca
          </CardTitle>
          <Button
            onClick={handlePrint}
            disabled={reportData.length === 0}
            className="gap-2"
          >
            <Printer className="h-4 w-4" /> Imprimir Relatório
          </Button>
        </CardHeader>
        <CardContent className="p-0 print:p-0">
          <Table className="print:text-sm">
            <TableHeader className="bg-slate-50 print:bg-transparent">
              <TableRow className="print:border-b-2 print:border-black">
                <TableHead className="w-[100px] print:text-black">
                  Data
                </TableHead>
                <TableHead className="print:text-black">Paciente</TableHead>
                <TableHead className="print:text-black">Tipo</TableHead>
                <TableHead className="print:text-black">
                  Fórmula / Descrição
                </TableHead>
                <TableHead className="text-right print:text-black">
                  Horários (Vol)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-12 text-muted-foreground"
                  >
                    Nenhuma prescrição encontrada para os filtros selecionados.
                  </TableCell>
                </TableRow>
              ) : (
                reportData.map((p) => (
                  <TableRow
                    key={p.id}
                    className="print:border-b print:border-gray-300"
                  >
                    <TableCell className="font-medium whitespace-nowrap print:text-black">
                      {p.date.split('-').reverse().join('/')}
                    </TableCell>
                    <TableCell className="font-semibold print:text-black">
                      {p.patient?.name || 'Registro Removido'}
                    </TableCell>
                    <TableCell className="print:text-black">
                      {p.type === 'milk' ? 'Leite/Fórmula' : 'Refeição'}
                    </TableCell>
                    <TableCell className="print:text-black">
                      <div className="font-medium">
                        {p.type === 'milk' ? p.milkType : p.description}
                      </div>
                      {p.restrictions && (
                        <div className="text-xs text-destructive print:text-gray-600 mt-0.5 font-semibold">
                          Restrições: {p.restrictions}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right print:text-black">
                      <span className="font-bold">{p.times.length} unid.</span>
                      {p.type === 'milk' && (
                        <span className="text-xs text-muted-foreground print:text-gray-600 ml-1">
                          ({p.volume}ml)
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
