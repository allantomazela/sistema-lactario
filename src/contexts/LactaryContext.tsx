import React, { createContext, useContext, useState, ReactNode } from 'react'
import { getLocalYYYYMMDD } from '@/lib/utils'

export type Patient = {
  id: string
  name: string
  bed: string
  ward: string
  recordId: string
  dietType: string
  allergies: string[]
  active: boolean
  birthDate?: string
  observations?: string
  restrictions?: string
}

export type PrescriptionType = 'milk' | 'meal'

export type Prescription = {
  id: string
  patientId: string
  type: PrescriptionType
  milkType?: string
  volume?: number
  additives?: string
  description?: string
  observations?: string
  restrictions?: string
  times: string[]
  expiryHours: number
  status: 'active' | 'inactive'
  date: string
}

interface LactaryContextType {
  patients: Patient[]
  prescriptions: Prescription[]
  addPatient: (patient: Patient) => void
  addPatients: (patients: Patient[]) => void
  updatePatient: (id: string, updates: Partial<Patient>) => void
  deletePatient: (id: string) => void
  addPrescription: (prescription: Omit<Prescription, 'id'>) => void
  getPatient: (id: string) => Patient | undefined
}

const mockPatients: Patient[] = [
  {
    id: 'p1',
    name: 'ENZO GABRIEL SILVA',
    bed: '12A',
    ward: 'Pediatria',
    recordId: 'REC-1029',
    dietType: 'Fórmula Infantil',
    allergies: ['PLV', 'Soja'],
    active: true,
    birthDate: '2023-05-10',
  },
  {
    id: 'p2',
    name: 'VALENTINA SOUZA',
    bed: '04B',
    ward: 'UTI Neonatal',
    recordId: 'REC-1030',
    dietType: 'Leite Materno',
    allergies: [],
    active: true,
    birthDate: '2023-11-20',
  },
  {
    id: 'p3',
    name: 'ARTHUR MIGUEL',
    bed: '08C',
    ward: 'Berçário',
    recordId: 'REC-1031',
    dietType: 'Dieta Pastosa',
    allergies: ['Glúten'],
    active: true,
    birthDate: '2022-08-15',
  },
]

const todayStr = getLocalYYYYMMDD(new Date())

const mockPrescriptions: Prescription[] = [
  {
    id: 'pr1',
    patientId: 'p1',
    type: 'milk',
    milkType: 'Fórmula Especial',
    volume: 120,
    additives: 'Espessante 2g',
    observations: 'Aquecer a 37 graus. Oferecer na mamadeira.',
    restrictions: 'Não usar bico ortodôntico. Alergia a PLV.',
    times: ['08:00', '11:00', '14:00', '17:00'],
    expiryHours: 24,
    status: 'active',
    date: todayStr,
  },
  {
    id: 'pr2',
    patientId: 'p2',
    type: 'milk',
    milkType: 'Leite Pasteurizado',
    volume: 90,
    times: ['09:00', '12:00', '15:00'],
    expiryHours: 12,
    status: 'active',
    date: todayStr,
  },
  {
    id: 'pr3',
    patientId: 'p3',
    type: 'meal',
    description: 'Papinha de Legumes com Carne (Sem Glúten)',
    times: ['11:30', '17:30'],
    expiryHours: 6,
    status: 'active',
    date: todayStr,
  },
]

const LactaryContext = createContext<LactaryContextType | undefined>(undefined)

export function LactaryProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(mockPatients)
  const [prescriptions, setPrescriptions] =
    useState<Prescription[]>(mockPrescriptions)

  const addPatient = (patient: Patient) => {
    setPatients((prev) => [...prev, patient])
  }

  const addPatients = (newPatients: Patient[]) => {
    setPatients((prev) => [...prev, ...newPatients])
  }

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    )
  }

  const deletePatient = (id: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== id))
  }

  const addPrescription = (prescription: Omit<Prescription, 'id'>) => {
    setPrescriptions((prev) => [
      ...prev,
      { ...prescription, id: `pr${prev.length + 1}` },
    ])
  }

  const getPatient = (id: string) => patients.find((p) => p.id === id)

  return React.createElement(
    LactaryContext.Provider,
    {
      value: {
        patients,
        prescriptions,
        addPatient,
        addPatients,
        updatePatient,
        deletePatient,
        addPrescription,
        getPatient,
      },
    },
    children,
  )
}

export function useLactary() {
  const context = useContext(LactaryContext)
  if (context === undefined) {
    throw new Error('useLactary must be used within a LactaryProvider')
  }
  return context
}
