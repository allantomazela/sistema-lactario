import { useState } from 'react'
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
import { Printer, Filter, AlertTriangle, Milk, Utensils } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const Labels = () => {
  const { patients, prescriptions } = useLactary()
  const { currentUser } = useAuth()
  const { labelSettings } = useSettings()
  const { toast } = useToast()

  const [selectedTime, setSelectedTime] = useState<string>('11:00')
  const [selectedWard, setSelectedWard] = useState<string>('all')

  const labelsToPrint = prescriptions
    .filter((p) => p.status === 'active' && p.times.includes(selectedTime))
    .map((p) => {
      const patient = patients.find((pat) => pat.id === p.patientId)
      return {
        ...p,
        patient,
      }
    })
    .filter(
      (l) =>
        l.patient &&
        (selectedWard === 'all' || l.patient.ward === selectedWard),
    )

  const handlePrint = () => {
    toast({
      title: 'Enviado para Impressão',
      description: `${labelsToPrint.length} etiquetas enviadas para a impressora térmica.`,
    })
    window.print()
  }

  const today = new Date()
  const prepDate = today.toLocaleDateString('pt-BR')
  const prepTime = today.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const userInitialsOrName = currentUser?.name.split(' ')[0] || '___'
  const { width, height, unit } = labelSettings

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
          }
          .thermal-label {
            width: ${width}${unit} !important;
            height: ${height}${unit} !important;
            max-width: none !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            page-break-after: always;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            aspect-ratio: auto !important;
            background: white !important;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}
      </style>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
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
          Imprimir Lote ({labelsToPrint.length})
        </Button>
      </div>

      <Card className="no-print border-dashed bg-slate-50">
        <CardContent className="p-4 flex flex-wrap gap-4 items-end">
          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" /> Horário de Preparo
            </label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Selecione o horário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="08:00">08:00</SelectItem>
                <SelectItem value="11:00">11:00</SelectItem>
                <SelectItem value="14:00">14:00</SelectItem>
                <SelectItem value="17:00">17:00</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 flex-1 min-w-[200px]">
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
        </CardContent>
      </Card>

      <div className="no-print mb-4">
        <h3 className="text-lg font-semibold border-b pb-2">
          Pré-visualização das Etiquetas (Padrão: {width}
          {unit} x {height}
          {unit})
        </h3>
      </div>

      <div
        id="print-area"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {labelsToPrint.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground no-print bg-slate-50 rounded-lg border border-dashed">
            Nenhuma etiqueta pendente para os filtros selecionados.
          </div>
        )}

        {labelsToPrint.map((label, index) => {
          const isMilk = label.type === 'milk'
          const expDate = new Date(
            today.getTime() + label.expiryHours * 60 * 60 * 1000,
          )
          const expDateStr = expDate.toLocaleDateString('pt-BR')
          const expTimeStr = expDate.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })

          const birthDateStr = label.patient?.birthDate
            ? label.patient.birthDate.split('-').reverse().join('/')
            : null

          return (
            <div
              key={index}
              className="thermal-label flex flex-col justify-between"
              style={{ aspectRatio: `${width}/${height}` }}
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b-[2px] border-black pb-1 mb-1 shrink-0 px-2 pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider leading-tight">
                  HCFMB - Lactário
                </h4>
                <div className="text-[9px] text-right font-semibold leading-tight flex items-center gap-2">
                  <span className="text-gray-700">
                    Prep: {prepDate} {prepTime} ({userInitialsOrName})
                  </span>
                  <span className="font-black bg-black text-white px-1.5 py-0.5 rounded-sm inline-flex items-center gap-1">
                    Val: {label.expiryHours}h
                    <span className="text-[8px] opacity-90 font-bold ml-0.5">
                      ({expDateStr} {expTimeStr})
                    </span>
                  </span>
                </div>
              </div>

              {/* Main Container */}
              <div className="flex flex-1 gap-3 min-h-0 px-2 pb-2">
                {/* Left Column (55%) */}
                <div className="flex-[0.55] flex flex-col justify-between border-r-[2px] border-black pr-3 min-h-0">
                  <div className="flex flex-col min-h-0">
                    <div className="flex justify-between items-end mb-0.5">
                      <div className="text-[10px] uppercase font-black text-gray-500 tracking-wider leading-none">
                        Paciente
                      </div>
                      <div className="text-[9px] font-bold text-gray-700 leading-none">
                        ID: {label.patient?.recordId || '--'}
                        {birthDateStr && ` | DN: ${birthDateStr}`}
                      </div>
                    </div>
                    <div className="text-[1.15rem] font-black uppercase leading-[1.1] line-clamp-2 mt-0.5">
                      {label.patient?.name}
                    </div>
                  </div>

                  <div className="flex justify-between items-end shrink-0 mt-1">
                    <div>
                      <div className="text-[10px] uppercase font-black text-gray-500 tracking-wider leading-none mb-1">
                        Leito / Ala
                      </div>
                      <div className="font-black leading-none flex items-baseline gap-1.5">
                        <span className="text-[1.35rem]">
                          {label.patient?.bed}
                        </span>
                        <span className="text-xs">{label.patient?.ward}</span>
                      </div>
                    </div>

                    {label.patient && label.patient.allergies.length > 0 && (
                      <div className="bg-black text-white px-1.5 py-1 rounded flex items-center gap-1 border border-black shadow-sm">
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        <span className="font-black text-[9px] uppercase leading-none mt-0.5">
                          {label.patient.allergies.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column (45%) */}
                <div className="flex-[0.45] flex flex-col min-h-0 justify-between">
                  <div className="flex flex-col min-h-0 mb-1.5">
                    <div className="flex items-center gap-1.5 mb-1 text-gray-700">
                      {isMilk ? (
                        <Milk className="h-3.5 w-3.5" />
                      ) : (
                        <Utensils className="h-3.5 w-3.5" />
                      )}
                      <span className="font-black uppercase text-[10px] leading-none tracking-wider mt-0.5">
                        {isMilk ? 'Lactário' : 'Refeição'} - {selectedTime}
                      </span>
                    </div>
                    <div className="text-sm font-black leading-tight line-clamp-2">
                      {isMilk
                        ? `${label.volume}ml - ${label.milkType}`
                        : label.description}
                    </div>
                  </div>

                  {/* Highlighted Observations Box */}
                  {label.additives ? (
                    <div className="flex-1 flex flex-col border-[2.5px] border-black rounded min-h-0 overflow-hidden">
                      <div className="bg-black text-white text-[9px] uppercase font-black px-1.5 py-0.5 tracking-widest shrink-0 flex items-center justify-between">
                        <span>Observações</span>
                        <span>!</span>
                      </div>
                      <div className="p-1.5 text-[0.85rem] font-black leading-tight text-black overflow-hidden break-words flex-1 bg-white flex items-center">
                        <span className="line-clamp-2">{label.additives}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col border-2 border-dashed border-gray-300 rounded min-h-0 justify-center items-center opacity-70">
                      <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                        Sem Observações
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Labels
