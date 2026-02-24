import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

const Settings = () => {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground mt-1">
          Gerencie as preferências do sistema do lactário.
        </p>
      </div>

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
                Imprimir tarja preta invertida para pacientes com restrições.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Salvar Alterações</Button>
      </div>
    </div>
  )
}

export default Settings
