import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
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
import { Save, Link2 } from 'lucide-react'

const Settings = () => {
  const { currentUser } = useAuth()
  const { toast } = useToast()

  const [apiBaseUrl, setApiBaseUrl] = useState('https://api.mv.com.br/v1')
  const [apiToken, setApiToken] = useState('************************')
  const [clientId, setClientId] = useState('HCFMB-01')
  const [integrationEnabled, setIntegrationEnabled] = useState(false)

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

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground mt-1">
          Gerencie as preferências e integrações do sistema do lactário.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2 mb-6">
          <TabsTrigger value="general">Geral</TabsTrigger>
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
