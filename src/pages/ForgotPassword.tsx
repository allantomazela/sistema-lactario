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
import { CheckCircle2 } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await resetPassword(email)
      setSuccess(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="shadow-lg text-center p-6 border-t-4 border-t-success">
        <CardContent className="pt-6 space-y-4 flex flex-col items-center">
          <CheckCircle2 className="h-16 w-16 text-success mb-2" />
          <h3 className="text-2xl font-bold text-slate-900">E-mail Enviado</h3>
          <p className="text-muted-foreground">
            Se o e-mail estiver cadastrado, você receberá instruções de
            recuperação em breve.
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
        <CardTitle className="text-2xl text-center">Recuperar Senha</CardTitle>
        <CardDescription className="text-center">
          Digite seu e-mail para receber instruções.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
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
          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Enviar Instruções'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t bg-slate-50/50 p-4">
        <Link
          to="/login"
          className="text-sm font-medium text-primary hover:underline"
        >
          Voltar para o Login
        </Link>
      </CardFooter>
    </Card>
  )
}
