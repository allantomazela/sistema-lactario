import React, { createContext, useContext, useState, ReactNode } from 'react'

export type Patient = {
  id: string
  name: string
  bed: string
  ward: string
  recordId: string
  dietType: string
  allergies: string[]
  active: boolean
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
  times: string[]
  expiryHours: number
  status: 'active' | 'inactive'
}

interface LactaryContextType {
  patients: Patient[]
  prescriptions: Prescription[]
  addPatient: (patient: Omit<Patient, 'id'>) => void
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
  },
]

const mockPrescriptions: Prescription[] = [
  {
    id: 'pr1',
    patientId: 'p1',
    type: 'milk',
    milkType: 'Fórmula Especial',
    volume: 120,
    additives: 'Espessante 2g',
    times: ['08:00', '11:00', '14:00', '17:00'],
    expiryHours: 24,
    status: 'active',
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
  },
  {
    id: 'pr3',
    patientId: 'p3',
    type: 'meal',
    description: 'Papinha de Legumes com Carne (Sem Glúten)',
    times: ['11:30', '17:30'],
    expiryHours: 6,
    status: 'active',
  },
]

const LactaryContext = createContext<LactaryContextType | undefined>(undefined)

export function LactaryProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(mockPatients)
  const [prescriptions, setPrescriptions] =
    useState<Prescription[]>(mockPrescriptions)

  const addPatient = (patient: Omit<Patient, 'id'>) => {
    setPatients((prev) => [...prev, { ...patient, id: `p${prev.length + 1}` }])
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
