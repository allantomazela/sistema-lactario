import { Outlet } from 'react-router-dom'
import { Baby } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 animate-fade-in">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center flex flex-col items-center">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Baby className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            HCFMB
          </h2>
          <p className="text-muted-foreground mt-2 font-medium">
            Lactário Central - Hospital das Clínicas de Botucatu
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
