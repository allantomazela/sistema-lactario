import { useState, useEffect } from 'react'
import { useLactary } from '@/contexts/LactaryContext'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/contexts/SettingsContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Printer,
  Calendar as CalendarIcon,
  AlertTriangle,
  Milk,
  Utensils,
  Info,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn, getLocalYYYYMMDD } from '@/lib/utils'

const Labels = () => {
  const { patients, prescriptions } = useLactary()
  const { currentUser } = useAuth()
  const { labelSettings } = useSettings()
  const { toast } = useToast()

  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedWard, setSelectedWard] = useState<string>('all')

  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [batchQty, setBatchQty] = useState<string>('1')

  const dateStr = date ? getLocalYYYYMMDD(date) : ''

  const dailyPrescriptions = prescriptions
    .filter((p) => p.status === 'active' && p.date === dateStr)
    .map((p) => {
      const patient = patients.find((pat) => pat.id === p.patientId)
      return { ...p, patient }
    })
    .filter(
      (l) =>
        l.patient &&
        (selectedWard === 'all' || l.patient.ward === selectedWard),
    )

  useEffect(() => {
    setSelectedRows(new Set())
  }, [dateStr, selectedWard])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(dailyPrescriptions.map((p) => p.id)))
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSet = new Set(selectedRows)
    if (checked) newSet.add(id)
    else newSet.delete(id)
    setSelectedRows(newSet)
  }

  const handleApplyBatch = () => {
    const qty = parseInt(batchQty, 10)
    if (isNaN(qty) || qty < 1) return
    const newQuantities = { ...quantities }
    selectedRows.forEach((id) => {
      newQuantities[id] = qty
    })
    setQuantities(newQuantities)
    toast({
      title: 'Lote Aplicado',
      description: `Quantidade ${qty} aplicada a ${selectedRows.size} prescrição(ões).`,
    })
  }

  const labelsToPrint = Array.from(selectedRows).flatMap((id) => {
    const p = dailyPrescriptions.find((p) => p.id === id)
    if (!p) return []
    const qty = quantities[p.id] ?? 1
    return Array.from({ length: qty }).map(() => p)
  })

  const handlePrint = () => {
    toast({
      title: 'Enviado para Impressão',
      description: `${labelsToPrint.length} etiquetas enviadas para a impressora.`,
    })
    window.print()
  }

  const today = new Date()
  const prepDate = today.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
  const prepTime = today.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const userInitialsOrName = currentUser?.name.split(' ')[0] || '___'
  const { width, height, unit } = labelSettings

  const renderLabel = (label: any, index: number) => {
    const isMilk = label.type === 'milk'
    const expDate = new Date(
      today.getTime() + label.expiryHours * 60 * 60 * 1000,
    )
    const expDateStr = expDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    })
    const expTimeStr = expDate.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })

    const birthDateStr = label.patient?.birthDate
      ? label.patient.birthDate.split('-').reverse().join('/')
      : null

    const hasBothExtras = !!(
      label.restrictions &&
      (label.observations || label.additives)
    )
    const textClampClass = hasBothExtras ? 'line-clamp-2' : 'line-clamp-3'

    return (
      <div
        key={index}
        className="thermal-label relative box-border bg-white text-black overflow-hidden flex flex-col shadow-sm border border-gray-300"
        style={{
          width: `${width}${unit}`,
          height: `${height}${unit}`,
          padding: '2mm',
        }}
      >
        {/* Header - Height approx 6mm */}
        <div className="flex justify-between items-center border-b-[1.5px] border-black pb-[1mm] mb-[1mm] shrink-0">
          <div className="flex items-center gap-[1.5mm]">
            <span className="text-[2.5mm] font-black uppercase leading-none tracking-tight">
              HCFMB
            </span>
            <span className="text-[2mm] font-bold leading-none border-l-[1.5px] border-black pl-[1.5mm]">
              Lactário
            </span>
          </div>
          <div className="text-[1.8mm] font-bold leading-none flex items-center gap-[1.5mm]">
            <span>
              Prep: {prepDate} {prepTime} ({userInitialsOrName})
            </span>
            <span className="bg-black text-white px-[1.2mm] py-[0.8mm] rounded-[0.5mm] font-black flex items-center gap-[0.8mm]">
              Val: {label.expiryHours}h
              <span className="font-semibold text-[1.5mm] opacity-90">
                ({expDateStr} {expTimeStr})
              </span>
            </span>
          </div>
        </div>

        {/* Main Body - Landscape optimized split */}
        <div className="flex flex-1 min-h-0 gap-[2.5mm]">
          {/* Left Column - Patient (approx 55%) */}
          <div className="flex-[0.55] flex flex-col min-h-0 border-r-[1.5px] border-black pr-[2.5mm]">
            <div className="flex justify-between items-end mb-[0.8mm] shrink-0">
              <span className="text-[1.8mm] font-black uppercase text-gray-500 leading-none tracking-wider">
                Paciente
              </span>
              <span className="text-[1.8mm] font-bold leading-none text-gray-700">
                ID: {label.patient?.recordId || '--'}
                {birthDateStr && ` | DN: ${birthDateStr}`}
              </span>
            </div>

            <div className="text-[3.5mm] font-black uppercase leading-[1.1] line-clamp-2 text-ellipsis overflow-hidden mb-[1mm]">
              {label.patient?.name}
            </div>

            <div className="flex justify-between items-end mt-auto shrink-0 pt-[1mm]">
              <div className="flex flex-col min-w-0 pr-[1mm]">
                <span className="text-[1.8mm] font-black uppercase text-gray-500 leading-none mb-[0.8mm] tracking-wider block">
                  Leito / Ala
                </span>
                <div className="font-black leading-none flex items-baseline gap-[1mm] truncate">
                  <span className="text-[3.8mm] shrink-0">
                    {label.patient?.bed}
                  </span>
                  <span className="text-[2.2mm] truncate">
                    {label.patient?.ward}
                  </span>
                </div>
              </div>

              {label.patient && label.patient.allergies.length > 0 && (
                <div className="bg-black text-white px-[1.5mm] py-[1mm] rounded-[0.5mm] flex flex-col items-center justify-center border-[1px] border-black max-w-[20mm] shrink-0">
                  <span className="text-[1.5mm] uppercase font-black leading-none tracking-widest mb-[0.4mm]">
                    Alergia
                  </span>
                  <span className="font-black text-[2mm] uppercase leading-[1] text-center line-clamp-2">
                    {label.patient.allergies.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Diet & Obs (approx 45%) */}
          <div className="flex-[0.45] flex flex-col min-h-0">
            <div className="flex items-center gap-[1.2mm] mb-[1mm] shrink-0 text-gray-800">
              {isMilk ? (
                <Milk className="h-[2.5mm] w-[2.5mm]" strokeWidth={2.5} />
              ) : (
                <Utensils className="h-[2.5mm] w-[2.5mm]" strokeWidth={2.5} />
              )}
              <span className="font-black uppercase text-[2.2mm] leading-none mt-[0.5mm] tracking-wide">
                {isMilk ? 'Lactário' : 'Refeição'}
              </span>
            </div>

            <div className="text-[2.8mm] font-black leading-[1.15] line-clamp-2 text-ellipsis overflow-hidden mb-[0.5mm] shrink-0">
              {isMilk
                ? `${label.volume}ml - ${label.milkType}`
                : label.description}
            </div>

            <div className="text-[2mm] font-bold leading-tight text-gray-700 mb-[1.5mm] line-clamp-2">
              Horários: {label.times.join(', ')}
            </div>

            {/* Observations & Restrictions Box */}
            {label.observations || label.restrictions || label.additives ? (
              <div className="flex-1 mt-auto flex flex-col gap-[1mm] overflow-hidden justify-end min-h-0 pt-[1mm]">
                {label.restrictions && (
                  <div className="flex flex-col border-[1.5px] border-black rounded-[0.8mm] overflow-hidden shrink-0">
                    <div className="bg-black text-white px-[1.2mm] py-[0.6mm] text-[1.6mm] font-black uppercase tracking-widest flex justify-between items-center leading-none">
                      <span>Restrições</span>
                      <AlertTriangle className="h-[1.5mm] w-[1.5mm]" />
                    </div>
                    <div className="bg-white px-[1.2mm] py-[0.6mm] flex items-center text-left">
                      <span
                        className={`text-[1.8mm] font-black leading-[1.1] text-black ${textClampClass}`}
                      >
                        {label.restrictions}
                      </span>
                    </div>
                  </div>
                )}
                {(label.observations || label.additives) && (
                  <div className="flex flex-col border-[1.5px] border-black rounded-[0.8mm] overflow-hidden shrink-0">
                    <div className="bg-gray-200 border-b-[1.5px] border-black text-black px-[1.2mm] py-[0.6mm] text-[1.6mm] font-black uppercase tracking-widest flex justify-between items-center leading-none">
                      <span>Observações</span>
                      <Info className="h-[1.5mm] w-[1.5mm]" />
                    </div>
                    <div className="bg-white px-[1.2mm] py-[0.6mm] flex items-center text-left">
                      <span
                        className={`text-[1.8mm] font-bold leading-[1.1] text-black ${textClampClass}`}
                      >
                        {label.observations || label.additives}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 mt-auto flex items-center justify-center border-[1.5px] border-dashed border-gray-400 rounded-[1mm] opacity-70 min-h-[10mm] bg-gray-50/50">
                <span className="text-[2mm] font-bold uppercase text-gray-500 tracking-wider">
                  Sem Restrições / Obs
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <style type="text/css" media="print">
        {`
          @page {
            size: ${width}${unit} ${height}${unit};
            margin: 0;
          }
          #print-area {
            display: block !important;
            grid-template-columns: 1fr !important;
            gap: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .thermal-label {
            width: ${width}${unit} !important;
            height: ${height}${unit} !important;
            max-width: ${width}${unit} !important;
            max-height: ${height}${unit} !important;
            margin: 0 !important;
            padding: 2mm !important;
            page-break-after: always;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: white !important;
            overflow: hidden !important;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              background: white;
            }
          }
        `}
      </style>

      <div className="print:hidden space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Central de Impressão
            </h2>
            <p className="text-muted-foreground mt-1">
              Gere e imprima etiquetas térmicas para frascos e refeições.
            </p>
          </div>
          <Button
            onClick={handlePrint}
            className="gap-2"
            size="lg"
            disabled={labelsToPrint.length === 0}
          >
            <Printer className="h-5 w-5" />
            Imprimir {labelsToPrint.length} Etiquetas
          </Button>
        </div>

        <Card className="border-dashed bg-slate-50">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-1.5 flex-1 min-w-[200px] max-w-xs">
              <label className="text-sm font-medium flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" /> Data de Produção
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal bg-white',
                      !date && 'text-muted-foreground',
                    )}
                  >
                    {date ? (
                      date.toLocaleDateString('pt-BR')
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5 flex-1 min-w-[200px] max-w-xs">
              <label className="text-sm font-medium">Ala / Setor</label>
              <Select value={selectedWard} onValueChange={setSelectedWard}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Todas as alas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Alas</SelectItem>
                  <SelectItem value="Pediatria">Pediatria</SelectItem>
                  <SelectItem value="UTI Neonatal">UTI Neonatal</SelectItem>
                  <SelectItem value="Berçário">Berçário</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1" />

            <div className="flex items-end gap-2 p-3 bg-white rounded-md border shadow-sm">
              <div className="space-y-1.5 w-24">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Lote (Qtd)
                </label>
                <Input
                  type="number"
                  min="1"
                  value={batchQty}
                  onChange={(e) => setBatchQty(e.target.value)}
                  className="h-9"
                />
              </div>
              <Button
                variant="secondary"
                onClick={handleApplyBatch}
                className="h-9"
                disabled={selectedRows.size === 0}
              >
                Aplicar Lote
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="border rounded-md bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-[50px] text-center">
                  <Checkbox
                    checked={
                      selectedRows.size > 0 &&
                      selectedRows.size === dailyPrescriptions.length
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Ala/Leito</TableHead>
                <TableHead>Dieta</TableHead>
                <TableHead>Horários</TableHead>
                <TableHead className="w-[100px] text-center">
                  Quantidade
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyPrescriptions.map((p) => (
                <TableRow
                  key={p.id}
                  className={selectedRows.has(p.id) ? 'bg-primary/5' : ''}
                >
                  <TableCell className="text-center">
                    <Checkbox
                      checked={selectedRows.has(p.id)}
                      onCheckedChange={(c) => handleSelectRow(p.id, !!c)}
                    />
                  </TableCell>
                  <TableCell className="font-semibold">
                    {p.patient?.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {p.patient?.ward} - {p.patient?.bed}
                  </TableCell>
                  <TableCell>
                    {p.type === 'milk' ? p.milkType : p.description}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded-md">
                      {p.times.join(', ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      value={quantities[p.id] ?? 1}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1
                        setQuantities((prev) => ({ ...prev, [p.id]: val }))
                        if (!selectedRows.has(p.id)) {
                          handleSelectRow(p.id, true)
                        }
                      }}
                      className="w-16 h-8 mx-auto text-center"
                    />
                  </TableCell>
                </TableRow>
              ))}
              {dailyPrescriptions.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-muted-foreground"
                  >
                    Nenhuma prescrição encontrada para os filtros selecionados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mb-4 mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2 gap-2">
            <h3 className="text-lg font-semibold">
              Pré-visualização de Amostra
            </h3>
            {labelsToPrint.length > 0 && (
              <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                Exibindo 1 amostra de {labelsToPrint.length} etiquetas no total
              </span>
            )}
          </div>

          <div className="mt-4 bg-slate-50 border border-dashed rounded-lg p-8 flex justify-center items-center min-h-[200px] overflow-x-auto">
            {labelsToPrint.length > 0 ? (
              <div className="shadow-md ring-1 ring-black/5 shrink-0 rounded">
                {renderLabel(labelsToPrint[0], 0)}
              </div>
            ) : (
              <div className="text-center text-muted-foreground flex flex-col items-center">
                <Info className="h-8 w-8 mb-2 opacity-20" />
                Nenhuma etiqueta selecionada para impressão.
              </div>
            )}
          </div>
        </div>
      </div>

      <div id="print-area" className="hidden">
        {labelsToPrint.map((label, index) => renderLabel(label, index))}
      </div>
    </div>
  )
}

export default Labels
