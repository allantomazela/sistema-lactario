import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader as SidebarHeaderUI,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar'
import {
  Activity,
  Users,
  FileText,
  Tags,
  Settings as SettingsIcon,
  PlusCircle,
  Baby,
  ShieldCheck,
  LogOut,
  Package,
  Truck,
  BarChart3,
  Bell,
  ShoppingCart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useAuth } from '@/contexts/AuthContext'
import { useInventory } from '@/contexts/InventoryContext'

export default function Layout() {
  const location = useLocation()
  const { currentUser, logout } = useAuth()
  const { items } = useInventory()

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const lowStockItems = items.filter((i) => i.quantity <= i.minLevel)

  const navItems = [
    { title: 'Início', path: '/', icon: Activity },
    { title: 'Pacientes', path: '/pacientes', icon: Users },
    { title: 'Prescrições', path: '/prescricoes', icon: FileText },
    { title: 'Gerar Etiquetas', path: '/etiquetas', icon: Tags },
    { title: 'Estoque', path: '/estoque', icon: Package },
    { title: 'Fornecedores', path: '/fornecedores', icon: Truck },
    { title: 'Pedidos', path: '/pedidos', icon: ShoppingCart },
    { title: 'Relatórios', path: '/relatorios', icon: BarChart3 },
  ]

  if (currentUser.role === 'admin') {
    navItems.push({
      title: 'Gerenciamento de Usuários',
      path: '/usuarios',
      icon: ShieldCheck,
    })
    navItems.push({
      title: 'Configurações',
      path: '/configuracoes',
      icon: SettingsIcon,
    })
  }

  const getPageTitle = () => {
    const item = navItems.find((i) => i.path === location.pathname)
    return item ? item.title : 'Lactário'
  }

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeaderUI className="py-6 px-4">
          <div className="flex items-center gap-2 text-primary">
            <Baby className="h-6 w-6 shrink-0" />
            <span className="text-sm font-bold tracking-tight leading-tight">
              Hospital das Clínicas de Botucatu - HCFMB
            </span>
          </div>
        </SidebarHeaderUI>
        <SidebarContent>
          <SidebarMenu className="px-2">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.path}
                >
                  <Link to={item.path} className="font-medium">
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Sair do Sistema
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-6 bg-white shadow-sm transition-[width,height] ease-linear">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-2" />
            <h1 className="text-lg font-semibold text-foreground hidden sm:block">
              {getPageTitle()}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {lowStockItems.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-white" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b bg-slate-50">
                  <h4 className="font-semibold">Notificações</h4>
                  <p className="text-xs text-muted-foreground">
                    Alertas de estoque mínimo
                  </p>
                </div>
                <div className="max-h-[300px] overflow-auto">
                  {lowStockItems.length === 0 ? (
                    <div className="p-4 text-sm text-center text-muted-foreground">
                      Nenhum item com estoque baixo.
                    </div>
                  ) : (
                    lowStockItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 border-b last:border-0 hover:bg-slate-50 text-sm"
                      >
                        <div className="font-medium text-destructive mb-0.5">
                          Estoque Crítico
                        </div>
                        <div className="text-slate-800 font-semibold">
                          {item.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Quantidade atual: {item.quantity} {item.unit} |
                          Mínimo: {item.minLevel} {item.unit}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <div className="hidden md:flex flex-col items-end text-sm mr-4">
              <span className="font-medium text-foreground line-clamp-1">
                {currentUser.name}
              </span>
              <span className="text-muted-foreground text-xs capitalize">
                {currentUser.role === 'admin'
                  ? 'Administrador'
                  : 'Usuário Padrão'}
              </span>
            </div>
            <Link to="/prescricoes">
              <Button size="sm" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Nova Prescrição</span>
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
