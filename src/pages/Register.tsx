import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setIsLoading(true)
    try {
      await register(name, email, password)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="shadow-lg text-center p-6 border-t-4 border-t-success">
        <CardContent className="pt-6 space-y-4 flex flex-col items-center">
          <CheckCircle2 className="h-16 w-16 text-success mb-2" />
          <h3 className="text-2xl font-bold text-slate-900">
            Solicitação Enviada
          </h3>
          <p className="text-muted-foreground">
            Sua solicitação de acesso foi enviada e aguarda aprovação do
            administrador.
          </p>
          <Link to="/login" className="w-full mt-4">
            <Button className="w-full" variant="outline">
              Voltar para Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg border-t-4 border-t-primary">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Novo Usuário</CardTitle>
        <CardDescription className="text-center">
          Solicite acesso ao sistema do lactário.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              className="bg-slate-50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail Institucional</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@hcfmb.br"
              className="bg-slate-50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-slate-50"
              />
            </div>
          </div>
          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Solicitar Acesso'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t bg-slate-50/50 p-4">
        <p className="text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <Link
            to="/login"
            className="text-primary font-medium hover:underline"
          >
            Faça login
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
