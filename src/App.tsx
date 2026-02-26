import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import AuthLayout from './components/AuthLayout'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Patients from './pages/Patients'
import PatientProfile from './pages/PatientProfile'
import Prescriptions from './pages/Prescriptions'
import Labels from './pages/Labels'
import Settings from './pages/Settings'
import Users from './pages/Users'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import { LactaryProvider } from './contexts/LactaryContext'
import { AuthProvider } from './contexts/AuthContext'
import { SettingsProvider } from './contexts/SettingsContext'

const App = () => (
  <BrowserRouter
    future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
  >
    <AuthProvider>
      <LactaryProvider>
        <SettingsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
              </Route>

              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/pacientes" element={<Patients />} />
                <Route path="/pacientes/:id" element={<PatientProfile />} />
                <Route path="/prescricoes" element={<Prescriptions />} />
                <Route path="/etiquetas" element={<Labels />} />
                <Route path="/configuracoes" element={<Settings />} />
                <Route path="/usuarios" element={<Users />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </SettingsProvider>
      </LactaryProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
