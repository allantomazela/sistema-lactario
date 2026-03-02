import { useState, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
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
import { Switch } from '@/components/ui/switch'
import { getLocalYYYYMMDD } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

// Enhanced mock data to support advanced filtering
const MOCK_CONSUMPTION = (() => {
  const data = []
  const items = [
    {
      name: 'Fórmula Infantil Padrão',
      cat: 'Leite',
      batches: ['L-101', 'L-102'],
    },
    {
      name: 'Leite Materno Pasteurizado',
      cat: 'Leite',
      batches: ['LMP-A', 'LMP-B'],
    },
    { name: 'Papinha de Legumes e Carne', cat: 'Refeição', batches: ['P-99'] },
    { name: 'Dieta Pastosa Almoço', cat: 'Refeição', batches: ['P-100'] },
    { name: 'Fórmula Especial HA', cat: 'Leite', batches: ['HA-22'] },
  ]
  const today = new Date()
  for (let i = 0; i < 90; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = getLocalYYYYMMDD(d)
    const count = Math.floor(Math.random() * 4) + 1
    for (let j = 0; j < count; j++) {
      const it = items[Math.floor(Math.random() * items.length)]
      data.push({
        id: crypto.randomUUID(),
        date: dateStr,
        itemName: it.name,
        category: it.cat,
        batch: it.batches[Math.floor(Math.random() * it.batches.length)],
        quantity: Math.floor(Math.random() * 5) + 1,
      })
    }
  }
  return data
})()

export default function Reports() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return getLocalYYYYMMDD(d)
  })
  const [endDate, setEndDate] = useState(() => getLocalYYYYMMDD(new Date()))

  const [compMode, setCompMode] = useState(false)
  const [compStartDate, setCompStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 60)
    return getLocalYYYYMMDD(d)
  })
  const [compEndDate, setCompEndDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 31)
    return getLocalYYYYMMDD(d)
  })

  const [batchFilter, setBatchFilter] = useState('all')

  const allBatches = useMemo(
    () => Array.from(new Set(MOCK_CONSUMPTION.map((d) => d.batch))),
    [],
  )

  const p1Data = useMemo(
    () =>
      MOCK_CONSUMPTION.filter(
        (d) =>
          d.date >= startDate &&
          d.date <= endDate &&
          (batchFilter === 'all' || d.batch === batchFilter),
      ),
    [startDate, endDate, batchFilter],
  )
  const p2Data = useMemo(
    () =>
      compMode
        ? MOCK_CONSUMPTION.filter(
            (d) =>
              d.date >= compStartDate &&
              d.date <= compEndDate &&
              (batchFilter === 'all' || d.batch === batchFilter),
          )
        : [],
    [compMode, compStartDate, compEndDate, batchFilter],
  )

  const summaryData = useMemo(() => {
    const map = new Map<
      string,
      { itemName: string; batch: string; p1Total: number; p2Total: number }
    >()
    p1Data.forEach((d) => {
      const k = `${d.itemName}-${d.batch}`
      if (!map.has(k))
        map.set(k, {
          itemName: d.itemName,
          batch: d.batch,
          p1Total: 0,
          p2Total: 0,
        })
      map.get(k)!.p1Total += d.quantity
    })
    p2Data.forEach((d) => {
      const k = `${d.itemName}-${d.batch}`
      if (!map.has(k))
        map.set(k, {
          itemName: d.itemName,
          batch: d.batch,
          p1Total: 0,
          p2Total: 0,
        })
      map.get(k)!.p2Total += d.quantity
    })
    const totalAllP1 = Array.from(map.values()).reduce(
      (sum, item) => sum + item.p1Total,
      0,
    )

    return Array.from(map.values())
      .map((item) => ({
        ...item,
        delta: item.p1Total - item.p2Total,
        percentage:
          totalAllP1 > 0
            ? ((item.p1Total / totalAllP1) * 100).toFixed(1)
            : '0.0',
      }))
      .sort((a, b) => b.p1Total - a.p1Total)
  }, [p1Data, p2Data])

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Relatórios de Consumo
        </h2>
        <p className="text-muted-foreground mt-1">
          Análise detalhada de consumo com filtros avançados e modo de
          comparação.
        </p>
      </div>

      <Card className="bg-slate-50 border-dashed">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Switch
                checked={compMode}
                onCheckedChange={setCompMode}
                id="comp-mode"
              />
              <Label
                htmlFor="comp-mode"
                className="font-semibold text-slate-700"
              >
                Ativar Modo Comparação
              </Label>
            </div>
            <div className="w-full sm:w-64">
              <Select value={batchFilter} onValueChange={setBatchFilter}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Filtrar por Lote" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Lotes</SelectItem>
                  {allBatches.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
            <div className="space-y-1.5">
              <Label>Data Inicial (Período 1)</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Data Final (Período 1)</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white"
              />
            </div>
            {compMode && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-amber-600">
                    Data Inicial (Período 2)
                  </Label>
                  <Input
                    type="date"
                    value={compStartDate}
                    onChange={(e) => setCompStartDate(e.target.value)}
                    className="bg-amber-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-amber-600">
                    Data Final (Período 2)
                  </Label>
                  <Input
                    type="date"
                    value={compEndDate}
                    onChange={(e) => setCompEndDate(e.target.value)}
                    className="bg-amber-50"
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Resumo de Consumo</CardTitle>
          <CardDescription>
            Volume total de preparações realizadas no lactário com base nos
            filtros.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Insumo / Refeição</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead className="text-right">Total (P1)</TableHead>
                <TableHead className="text-right">% do Período</TableHead>
                {compMode && (
                  <TableHead className="text-right">Total (P2)</TableHead>
                )}
                {compMode && (
                  <TableHead className="text-center">Variação</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaryData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={compMode ? 6 : 4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum dado encontrado para o período selecionado.
                  </TableCell>
                </TableRow>
              ) : (
                summaryData.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">
                      {row.itemName}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {row.batch}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {row.p1Total}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {row.percentage}%
                    </TableCell>
                    {compMode && (
                      <TableCell className="text-right text-muted-foreground">
                        {row.p2Total}
                      </TableCell>
                    )}
                    {compMode && (
                      <TableCell className="text-center">
                        {row.delta > 0 ? (
                          <span className="flex items-center justify-center text-success font-medium">
                            <TrendingUp className="h-4 w-4 mr-1" /> +{row.delta}
                          </span>
                        ) : row.delta < 0 ? (
                          <span className="flex items-center justify-center text-destructive font-medium">
                            <TrendingDown className="h-4 w-4 mr-1" />{' '}
                            {row.delta}
                          </span>
                        ) : (
                          <span className="flex items-center justify-center text-muted-foreground">
                            <Minus className="h-4 w-4 mr-1" /> 0
                          </span>
                        )}
                      </TableCell>
                    )}
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
