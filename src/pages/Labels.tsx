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
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center sm:justify-items-start"
      >
        {labelsToPrint.length === 0 && (
          <div className="col-span-full w-full py-12 text-center text-muted-foreground no-print bg-slate-50 rounded-lg border border-dashed">
            Nenhuma etiqueta pendente para os filtros selecionados.
          </div>
        )}

        {labelsToPrint.map((label, index) => {
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
                      <Utensils
                        className="h-[2.5mm] w-[2.5mm]"
                        strokeWidth={2.5}
                      />
                    )}
                    <span className="font-black uppercase text-[2.2mm] leading-none mt-[0.5mm] tracking-wide">
                      {isMilk ? 'Lactário' : 'Refeição'} - {selectedTime}
                    </span>
                  </div>

                  <div className="text-[2.8mm] font-black leading-[1.15] line-clamp-2 text-ellipsis overflow-hidden mb-[1.5mm]">
                    {isMilk
                      ? `${label.volume}ml - ${label.milkType}`
                      : label.description}
                  </div>

                  {/* Observations Box - Highly visible block */}
                  {label.additives ? (
                    <div className="flex-1 mt-auto flex flex-col border-[1.8px] border-black rounded-[1mm] overflow-hidden min-h-[10mm]">
                      <div className="bg-black text-white px-[1.5mm] py-[0.8mm] text-[1.8mm] font-black uppercase tracking-widest flex justify-between items-center shrink-0 leading-none">
                        <span>Atenção / Obs</span>
                        <AlertTriangle className="h-[1.8mm] w-[1.8mm]" />
                      </div>
                      <div className="flex-1 bg-white p-[1.5mm] flex items-center text-left overflow-hidden relative">
                        {/* Soft background pattern for attention could be added, but solid white is safer for printing text clearly */}
                        <span className="text-[2.4mm] font-black leading-[1.15] text-black line-clamp-3">
                          {label.additives}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 mt-auto flex items-center justify-center border-[1.5px] border-dashed border-gray-400 rounded-[1mm] opacity-70 min-h-[10mm] bg-gray-50/50">
                      <span className="text-[2mm] font-bold uppercase text-gray-500 tracking-wider">
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
