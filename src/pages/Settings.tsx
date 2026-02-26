import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/contexts/SettingsContext'
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
import { Save, Link2, Tags } from 'lucide-react'
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

  const [apiBaseUrl, setApiBaseUrl] = useState('https://api.mv.com.br/v1')
  const [apiToken, setApiToken] = useState('************************')
  const [clientId, setClientId] = useState('HCFMB-01')
  const [integrationEnabled, setIntegrationEnabled] = useState(false)

  const [labelWidth, setLabelWidth] = useState(labelSettings.width.toString())
  const [labelHeight, setLabelHeight] = useState(
    labelSettings.height.toString(),
  )
  const [labelUnit, setLabelUnit] = useState<'cm' | 'mm'>(labelSettings.unit)

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

    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
      toast({
        title: 'Valores Inválidos',
        description:
          'As dimensões devem ser números positivos maiores que zero.',
        variant: 'destructive',
      })
      return
    }

    updateLabelSettings({ width: w, height: h, unit: labelUnit })
    toast({
      title: 'Padrões de Impressão Salvos',
      description: 'As dimensões das etiquetas foram atualizadas.',
    })
  }

  const handleRestoreLabelDefaults = () => {
    setLabelWidth('10.5')
    setLabelHeight('4')
    setLabelUnit('cm')
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground mt-1">
          Gerencie as preferências e integrações do sistema do lactário.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full md:w-[600px] grid-cols-3 mb-6">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="labels" className="gap-2">
            <Tags className="h-4 w-4" />
            Padrões de Impressão
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Link2 className="h-4 w-4" />
            Integrações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
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

          <Card>
            <CardHeader>
              <CardTitle>Preferências de Impressão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Impressão Automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar diretamente para a impressora padrão ao clicar em
                    imprimir lote.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Destacar Alergias</Label>
                  <p className="text-sm text-muted-foreground">
                    Imprimir tarja preta invertida para pacientes com
                    restrições.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6 bg-slate-50/50 rounded-b-lg">
              <Button onClick={handleSaveGeneral} className="gap-2">
                <Save className="h-4 w-4" />
                Salvar Alterações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="labels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Padrões de Impressão de Etiquetas</CardTitle>
              <CardDescription>
                Configure as dimensões físicas das etiquetas para a impressora
                térmica.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="labelWidth">Comprimento (Largura)</Label>
                  <Input
                    id="labelWidth"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={labelWidth}
                    onChange={(e) => setLabelWidth(e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="labelHeight">Altura</Label>
                  <Input
                    id="labelHeight"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={labelHeight}
                    onChange={(e) => setLabelHeight(e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unidade de Medida</Label>
                  <Select
                    value={labelUnit}
                    onValueChange={(v) => setLabelUnit(v as 'cm' | 'mm')}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cm">Centímetros (cm)</SelectItem>
                      <SelectItem value="mm">Milímetros (mm)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={handleRestoreLabelDefaults}>
                  Restaurar Padrão (10.5cm x 4cm)
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6 bg-slate-50/50 rounded-b-lg">
              <Button onClick={handleSaveLabels} className="gap-2">
                <Save className="h-4 w-4" />
                Salvar Padrões
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integração Sistema MV</CardTitle>
              <CardDescription>
                Configure a conexão com o prontuário eletrônico MV para
                sincronização automática de pacientes e prescrições.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 border rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">
                    Status da Integração
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Ativar ou desativar a sincronização com o MV.
                  </p>
                </div>
                <Switch
                  checked={integrationEnabled}
                  onCheckedChange={setIntegrationEnabled}
                />
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="apiUrl">URL Base da API</Label>
                  <Input
                    id="apiUrl"
                    value={apiBaseUrl}
                    onChange={(e) => setApiBaseUrl(e.target.value)}
                    placeholder="https://api.hospital.com.br/mv/v1"
                    disabled={!integrationEnabled}
                    className="bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiToken">Token de Autenticação</Label>
                    <Input
                      id="apiToken"
                      type="password"
                      value={apiToken}
                      onChange={(e) => setApiToken(e.target.value)}
                      placeholder="Insira o Bearer Token ou API Key"
                      disabled={!integrationEnabled}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientId">
                      Identificador do Sistema (Client ID)
                    </Label>
                    <Input
                      id="clientId"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="Ex: HCFMB-LACTARIO"
                      disabled={!integrationEnabled}
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6 bg-slate-50/50 rounded-b-lg">
              <Button onClick={handleSaveIntegration} className="gap-2">
                <Save className="h-4 w-4" />
                Salvar Integrações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Settings
