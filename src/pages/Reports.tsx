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
import { getLocalYYYYMMDD } from '@/lib/utils'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { BarChart3 } from 'lucide-react'

// Mock Data Generator for Consumption
const MOCK_CONSUMPTION = (() => {
  const data = []
  const items = [
    { name: 'Fórmula Infantil Padrão', cat: 'Frasco de Leite' },
    { name: 'Leite Materno Pasteurizado', cat: 'Frasco de Leite' },
    { name: 'Papinha de Legumes e Carne', cat: 'Refeição' },
    { name: 'Dieta Pastosa Almoço', cat: 'Refeição' },
    { name: 'Fórmula Especial HA', cat: 'Frasco de Leite' },
  ]
  const today = new Date()
  for (let i = 0; i < 60; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = getLocalYYYYMMDD(d)
    const count = Math.floor(Math.random() * 5) + 2
    for (let j = 0; j < count; j++) {
      const it = items[Math.floor(Math.random() * items.length)]
      data.push({
        id: crypto.randomUUID(),
        date: dateStr,
        itemName: it.name,
        category: it.cat,
        quantity: Math.floor(Math.random() * 8) + 1,
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

  const filteredData = useMemo(() => {
    return MOCK_CONSUMPTION.filter(
      (d) => d.date >= startDate && d.date <= endDate,
    )
  }, [startDate, endDate])

  const summaryData = useMemo(() => {
    const map = new Map<
      string,
      { itemName: string; category: string; total: number }
    >()
    filteredData.forEach((d) => {
      const key = `${d.itemName}-${d.category}`
      if (!map.has(key))
        map.set(key, { itemName: d.itemName, category: d.category, total: 0 })
      map.get(key)!.total += d.quantity
    })
    return Array.from(map.values()).sort((a, b) => b.total - a.total)
  }, [filteredData])

  const chartData = useMemo(() => {
    const map = new Map<string, number>()
    let curr = new Date(startDate)
    const end = new Date(endDate)
    let iterations = 0
    while (curr <= end && iterations < 365) {
      map.set(getLocalYYYYMMDD(curr), 0)
      curr.setDate(curr.getDate() + 1)
      iterations++
    }
    filteredData.forEach((d) => {
      if (map.has(d.date)) {
        map.set(d.date, map.get(d.date)! + d.quantity)
      }
    })
    return Array.from(map.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [filteredData, startDate, endDate])

  const chartConfig = {
    total: {
      label: 'Quantidade Consumida',
      color: 'hsl(var(--primary))',
    },
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Relatórios de Consumo
          </h2>
          <p className="text-muted-foreground mt-1">
            Acompanhe o histórico de consumo de fórmulas e refeições.
          </p>
        </div>
      </div>

      <Card className="bg-slate-50 border-dashed">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-end">
          <div className="space-y-1.5 flex-1 min-w-[200px] max-w-xs">
            <Label>Data Inicial</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white"
            />
          </div>
          <div className="space-y-1.5 flex-1 min-w-[200px] max-w-xs">
            <Label>Data Final</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white"
            />
          </div>
          <div className="flex-1" />
          <div className="text-sm font-medium text-muted-foreground bg-white px-4 py-2 rounded-md border shadow-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Total: {summaryData.reduce((acc, curr) => acc + curr.total, 0)}{' '}
            itens
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle>Tendência de Consumo Diário</CardTitle>
            <CardDescription>
              Visualização do volume total por dia no período selecionado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) =>
                    value.split('-').slice(1).reverse().join('/')
                  }
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                <ChartTooltip
                  cursor={{ fill: 'var(--color-secondary)' }}
                  content={<ChartTooltipContent />}
                />
                <Bar
                  dataKey="total"
                  fill="var(--color-total)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle>Resumo por Insumo</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Insumo / Refeição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Quantidade Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaryData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
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
                      <TableCell className="text-muted-foreground">
                        {row.category}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {row.total}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
