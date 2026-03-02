import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/contexts/SettingsContext'
import { useLactary } from '@/contexts/LactaryContext'
import { useToast } from '@/hooks/use-toast'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Save, Link2, Tags, Bookmark, Trash2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const Settings = () => {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const { labelSettings, updateLabelSettings } = useSettings()
  const { templates, deleteTemplate } = useLactary()

  const [apiBaseUrl, setApiBaseUrl] = useState('https://api.mv.com.br/v1')
  const [apiToken, setApiToken] = useState('************************')
  const [clientId, setClientId] = useState('HCFMB-01')
  const [integrationEnabled, setIntegrationEnabled] = useState(false)

  const [labelWidth, setLabelWidth] = useState(labelSettings.width.toString())
  const [labelHeight, setLabelHeight] = useState(
    labelSettings.height.toString(),
  )
  const [labelUnit, setLabelUnit] = useState<'cm' | 'mm'>(labelSettings.unit)

  const [marginTop, setMarginTop] = useState(labelSettings.marginTop.toString())
  const [marginBottom, setMarginBottom] = useState(
    labelSettings.marginBottom.toString(),
  )
  const [marginLeft, setMarginLeft] = useState(
    labelSettings.marginLeft.toString(),
  )
  const [marginRight, setMarginRight] = useState(
    labelSettings.marginRight.toString(),
  )

  if (currentUser?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  const handleSaveIntegration = () => {
    toast({
      title: 'Configurações Salvas',
      description:
        'As configurações de integração foram atualizadas com sucesso.',
    })
  }

  const handleSaveGeneral = () => {
    toast({
      title: 'Configurações Salvas',
      description: 'As preferências do sistema foram atualizadas.',
    })
  }

  const handleSaveLabels = () => {
    const w = parseFloat(labelWidth)
    const h = parseFloat(labelHeight)
    const mt = parseFloat(marginTop)
    const mb = parseFloat(marginBottom)
    const ml = parseFloat(marginLeft)
    const mr = parseFloat(marginRight)

    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
      toast({
        title: 'Valores Inválidos',
        description:
          'As dimensões devem ser números positivos maiores que zero.',
        variant: 'destructive',
      })
      return
    }

    updateLabelSettings({
      width: w,
      height: h,
      unit: labelUnit,
      marginTop: isNaN(mt) ? 0 : mt,
      marginBottom: isNaN(mb) ? 0 : mb,
      marginLeft: isNaN(ml) ? 0 : ml,
      marginRight: isNaN(mr) ? 0 : mr,
    })
    toast({
      title: 'Padrões de Impressão Salvos',
      description: 'As dimensões e margens das etiquetas foram atualizadas.',
    })
  }

  const handleRestoreLabelDefaults = () => {
    setLabelWidth('10.5')
    setLabelHeight('4')
    setLabelUnit('cm')
    setMarginTop('0.2')
    setMarginBottom('0.2')
    setMarginLeft('0.2')
    setMarginRight('0.2')
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground mt-1">
          Gerencie as preferências, impressões e templates do sistema.
        </p>
      </div>

      <Tabs defaultValue="labels" className="w-full">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 md:grid-cols-4 mb-6 h-auto p-1">
          <TabsTrigger value="general" className="py-2">
            Geral
          </TabsTrigger>
          <TabsTrigger value="labels" className="gap-2 py-2">
            <Tags className="h-4 w-4 hidden sm:block" />
            Impressão
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2 py-2">
            <Bookmark className="h-4 w-4 hidden sm:block" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2 py-2">
            <Link2 className="h-4 w-4 hidden sm:block" />
            Integrações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {/* Resto do conteúdo da aba Geral inalterado */}
          <Card>
            <CardHeader>
              <CardTitle>Regras de Validade</CardTitle>
              <CardDescription>
                Defina o tempo padrão de validade para cada tipo de preparo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Fórmula Infantil Padrão</Label>
                  <p className="text-sm text-muted-foreground">
                    Tempo em horas após preparo sob refrigeração.
                  </p>
                </div>
                <div className="font-semibold text-lg">24 horas</div>
              </div>
              <div className="flex items-center justify-between border-b pb-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Leite Materno Cru</Label>
                  <p className="text-sm text-muted-foreground">
                    Tempo em horas após extração.
                  </p>
                </div>
                <div className="font-semibold text-lg">12 horas</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Padrões e Margens de Impressão</CardTitle>
              <CardDescription>
                Configure as dimensões físicas das etiquetas e as margens para
                ajuste perfeito no rolo da impressora.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4 border-b pb-2">
                  Dimensões do Rolo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Comprimento (Largura)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={labelWidth}
                      onChange={(e) => setLabelWidth(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Altura</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={labelHeight}
                      onChange={(e) => setLabelHeight(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unidade</Label>
                    <Select
                      value={labelUnit}
                      onValueChange={(v) => setLabelUnit(v as 'cm' | 'mm')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cm">Centímetros (cm)</SelectItem>
                        <SelectItem value="mm">Milímetros (mm)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4 border-b pb-2">
                  Margens de Impressão
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label>Superior</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={marginTop}
                      onChange={(e) => setMarginTop(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Inferior</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={marginBottom}
                      onChange={(e) => setMarginBottom(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Esquerda</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={marginLeft}
                      onChange={(e) => setMarginLeft(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Direita</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={marginRight}
                      onChange={(e) => setMarginRight(e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  As margens são aplicadas para evitar que o texto seja cortado
                  nas bordas da etiqueta. Unidade:{' '}
                  {labelUnit === 'cm' ? 'cm' : 'mm'}.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={handleRestoreLabelDefaults}>
                  Restaurar Padrão de Margens
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6 bg-slate-50/50 rounded-b-lg">
              <Button onClick={handleSaveLabels} className="gap-2">
                <Save className="h-4 w-4" />
                Salvar Configurações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meus Templates</CardTitle>
              <CardDescription>
                Gerencie as dietas pré-configuradas salvas no sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                  Nenhum template salvo. Crie templates durante o registro de
                  novas prescrições.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="border rounded-lg p-4 bg-white shadow-sm flex justify-between items-start"
                    >
                      <div className="space-y-1">
                        <h4 className="font-semibold text-slate-800">
                          {template.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {template.type === 'milk'
                            ? template.milkType
                            : template.description}
                        </p>
                        <div className="text-xs bg-slate-100 inline-flex px-2 py-0.5 rounded text-slate-600 font-medium mt-2">
                          {template.times.length} horários (
                          {template.times.slice(0, 3).join(', ')}
                          {template.times.length > 3 ? '...' : ''})
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          deleteTemplate(template.id)
                          toast({ title: 'Template removido' })
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          {/* Conteúdo mantido */}
          <Card>
            <CardHeader>
              <CardTitle>Integração Sistema MV</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 border rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">
                    Status da Integração
                  </Label>
                </div>
                <Switch
                  checked={integrationEnabled}
                  onCheckedChange={setIntegrationEnabled}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6 bg-slate-50/50 rounded-b-lg">
              <Button onClick={handleSaveIntegration} className="gap-2">
                <Save className="h-4 w-4" /> Salvar Integrações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Settings
