import { useAuth } from '@/contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, X, ShieldAlert } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Users() {
  const { currentUser, users, approveUser, rejectUser } = useAuth()
  const { toast } = useToast()

  if (currentUser?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  const pendingUsers = users.filter((u) => u.status === 'pending')
  const otherUsers = users.filter((u) => u.status !== 'pending')

  const handleApprove = (id: string, name: string) => {
    approveUser(id)
    toast({
      title: 'Usuário Aprovado',
      description: `O acesso de ${name} foi liberado no sistema.`,
    })
  }

  const handleReject = (id: string, name: string) => {
    rejectUser(id)
    toast({
      title: 'Usuário Recusado',
      description: `O acesso de ${name} foi negado.`,
      variant: 'destructive',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-success text-white border-transparent">
            Aprovado
          </Badge>
        )
      case 'rejected':
        return <Badge variant="destructive">Recusado</Badge>
      default:
        return <Badge variant="secondary">Pendente</Badge>
    }
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Gerenciamento de Usuários
        </h2>
        <p className="text-muted-foreground mt-1">
          Aprove ou recuse novos acessos ao sistema do lactário.
        </p>
      </div>

      <Card className="border-t-4 border-t-amber-500 shadow-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b bg-slate-50/50 rounded-t-xl flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold text-slate-800">
              Solicitações Pendentes ({pendingUsers.length})
            </h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhuma solicitação pendente no momento.
                  </TableCell>
                </TableRow>
              ) : (
                pendingUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive hover:text-white"
                          onClick={() => handleReject(user.id, user.name)}
                        >
                          <X className="h-4 w-4 mr-1" /> Recusar
                        </Button>
                        <Button
                          size="sm"
                          className="bg-success hover:bg-success/90 text-white"
                          onClick={() => handleApprove(user.id, user.name)}
                        >
                          <Check className="h-4 w-4 mr-1" /> Aprovar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b bg-slate-50/50 rounded-t-xl">
            <h3 className="font-semibold text-slate-800">
              Usuários Registrados
            </h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {otherUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell className="capitalize">
                    {user.role === 'admin' ? 'Administrador' : 'Usuário Padrão'}
                  </TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
