import React from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { MainLayout } from './layouts/MainLayout'
import ExecutiveDashboard from './views/ExecutiveDashboard'
import CoverageDashboard from './views/CoverageDashboard'
import HptImpactCenter from './views/HptImpactCenter'
import HrDashboard from './views/HrDashboard'
import OperationalRiskCenter from './views/OperationalRiskCenter'

function AppContent() {
  const { activeView } = useApp()

  const renderActiveView = () => {
    switch (activeView) {
      case 'executive':
        return <ExecutiveDashboard />
      case 'coverage':
        return <CoverageDashboard />
      case 'hpt-center':
        return <HptImpactCenter />
      case 'hr':
        return <HrDashboard />
      case 'risk-center':
        return <OperationalRiskCenter />
      default:
        return <ExecutiveDashboard />
    }
  }

  return (
    <MainLayout>
      {renderActiveView()}
    </MainLayout>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
