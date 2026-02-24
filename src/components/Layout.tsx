import { Outlet, Link, useLocation } from 'react-router-dom'
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
} from '@/components/ui/sidebar'
import {
  Activity,
  Users,
  FileText,
  Tags,
  Settings,
  PlusCircle,
  Baby,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  { title: 'Início', path: '/', icon: Activity },
  { title: 'Pacientes', path: '/pacientes', icon: Users },
  { title: 'Prescrições', path: '/prescricoes', icon: FileText },
  { title: 'Gerar Etiquetas', path: '/etiquetas', icon: Tags },
  { title: 'Configurações', path: '/configuracoes', icon: Settings },
]

export default function Layout() {
  const location = useLocation()

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
            <div className="hidden md:flex flex-col items-end text-sm mr-4">
              <span className="font-medium text-foreground">
                Nutricionista Plantonista
              </span>
              <span className="text-muted-foreground text-xs">
                Setor: Lactário Central
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
