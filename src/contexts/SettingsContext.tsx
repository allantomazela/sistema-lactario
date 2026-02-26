import React, { createContext, useContext, useState, ReactNode } from 'react'

export type LabelUnit = 'cm' | 'mm'

export interface LabelSettings {
  width: number
  height: number
  unit: LabelUnit
}

interface SettingsContextType {
  labelSettings: LabelSettings
  updateLabelSettings: (settings: LabelSettings) => void
}

const defaultSettings: LabelSettings = {
  width: 10.5,
  height: 4,
  unit: 'cm',
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [labelSettings, setLabelSettings] = useState<LabelSettings>(() => {
    const stored = localStorage.getItem('labelSettings')
    return stored ? JSON.parse(stored) : defaultSettings
  })

  const updateLabelSettings = (settings: LabelSettings) => {
    setLabelSettings(settings)
    localStorage.setItem('labelSettings', JSON.stringify(settings))
  }

  return React.createElement(
    SettingsContext.Provider,
    {
      value: {
        labelSettings,
        updateLabelSettings,
      },
    },
    children,
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
