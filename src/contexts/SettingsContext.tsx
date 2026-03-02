import React, { createContext, useContext, useState, ReactNode } from 'react'

export type LabelUnit = 'cm' | 'mm'

export interface LabelSettings {
  width: number
  height: number
  unit: LabelUnit
  marginTop: number
  marginBottom: number
  marginLeft: number
  marginRight: number
}

interface SettingsContextType {
  labelSettings: LabelSettings
  updateLabelSettings: (settings: LabelSettings) => void
}

const defaultSettings: LabelSettings = {
  width: 10.5,
  height: 4,
  unit: 'cm',
  marginTop: 0.2,
  marginBottom: 0.2,
  marginLeft: 0.2,
  marginRight: 0.2,
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [labelSettings, setLabelSettings] = useState<LabelSettings>(() => {
    const stored = localStorage.getItem('labelSettings')
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...defaultSettings, ...parsed } // Merge missing keys like new margins
    }
    return defaultSettings
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
