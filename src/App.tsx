import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Patients from './pages/Patients'
import Prescriptions from './pages/Prescriptions'
import Labels from './pages/Labels'
import Settings from './pages/Settings'
import { LactaryProvider } from './contexts/LactaryContext'

const App = () => (
  <BrowserRouter
    future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
  >
    <LactaryProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/pacientes" element={<Patients />} />
            <Route path="/prescricoes" element={<Prescriptions />} />
            <Route path="/etiquetas" element={<Labels />} />
            <Route path="/configuracoes" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </LactaryProvider>
  </BrowserRouter>
)

export default App
