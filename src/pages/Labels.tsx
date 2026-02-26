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

  // Generate label data combining prescription and patient info for a specific time
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

  // Formatting helpers
  const today = new Date()
  const prepDate = today.toLocaleDateString('pt-BR')
  const prepTime = today.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  // Get current user first name or a fallback
  const userInitialsOrName = currentUser?.name.split(' ')[0] || '___'

  // Print specific settings
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
          }
          .thermal-label {
            width: ${width}${unit} !important;
            height: ${height}${unit} !important;
            max-width: none !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 2mm !important;
            page-break-after: always;
            border: none !important;
            overflow: hidden;
            box-sizing: border-box;
          }
          /* Adjust font sizes down slightly when printing specifically restricted heights */
          @media print {
            .thermal-label {
              font-size: 80%;
            }
            .thermal-label .text-2xl {
              font-size: 1.25rem !important;
              line-height: 1.2 !important;
            }
            .thermal-label .text-xl {
              font-size: 1rem !important;
              line-height: 1.1 !important;
            }
            .thermal-label .text-lg {
              font-size: 0.875rem !important;
              line-height: 1.1 !important;
            }
            .thermal-label .text-sm {
              font-size: 0.75rem !important;
            }
            .thermal-label .text-xs {
              font-size: 0.65rem !important;
            }
            .thermal-label .text-[10px] {
              font-size: 0.5rem !important;
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

      {/* Printable Area */}
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

          // Calculate Expiry
          const expDate = new Date(
            today.getTime() + label.expiryHours * 60 * 60 * 1000,
          )
          const expDateStr = expDate.toLocaleDateString('pt-BR')
          const expTimeStr = expDate.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })

          return (
            <div
              key={index}
              className="thermal-label flex flex-col justify-between h-auto min-h-[320px]"
            >
              <div className="text-center border-b-2 border-black pb-1 mb-1">
                <h4 className="text-[10px] font-bold uppercase tracking-wider leading-tight">
                  HCFMB - Lactário
                </h4>
              </div>

              <div className="flex-1 space-y-1">
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-600">
                    Paciente
                  </div>
                  <div className="text-xl font-black uppercase leading-tight line-clamp-2">
                    {label.patient?.name}
                  </div>
                </div>

                <div className="flex justify-between border-y-2 border-black py-1 my-1">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-600">
                      Leito
                    </div>
                    <div className="text-2xl font-black">
                      {label.patient?.bed}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-gray-600">
                      Ala
                    </div>
                    <div className="text-lg font-bold">
                      {label.patient?.ward}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-100 p-1 rounded-sm border border-gray-300">
                  <div className="flex items-center gap-1 mb-0.5">
                    {isMilk ? (
                      <Milk className="h-3 w-3" />
                    ) : (
                      <Utensils className="h-3 w-3" />
                    )}
                    <span className="font-bold uppercase text-xs">
                      {isMilk ? 'Lactário' : 'Refeição'} - {selectedTime}
                    </span>
                  </div>
                  <div className="text-sm font-black leading-tight">
                    {isMilk
                      ? `${label.volume}ml - ${label.milkType}`
                      : label.description}
                  </div>
                  {label.additives && (
                    <div className="text-xs font-bold">+ {label.additives}</div>
                  )}
                </div>

                {label.patient && label.patient.allergies.length > 0 && (
                  <div className="bg-black text-white p-1 rounded-sm flex items-start gap-1 border-2 border-black">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase font-bold">
                        Alergia
                      </div>
                      <div className="font-black text-xs uppercase">
                        {label.patient.allergies.join(', ')}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-2 pt-1 border-t-2 border-black text-xs grid grid-cols-2 gap-1 font-medium leading-tight">
                <div>
                  Prep: {prepDate} {prepTime}
                  <br />
                  Resp: {userInitialsOrName}
                </div>
                <div className="text-right">
                  Val: {label.expiryHours}h<br />
                  <strong>
                    {expDateStr} {expTimeStr}
                  </strong>
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
