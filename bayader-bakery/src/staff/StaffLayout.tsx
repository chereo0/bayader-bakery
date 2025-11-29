import React, { useState, useEffect } from 'react'
import StaffNavbar from './StaffNavbar'
import StaffLayoutSidebar from './StaffLayoutSidebar'
import StaffOverview from './pages/StaffOverview'
import StaffOrdersPage from './pages/StaffOrdersPage'
import StaffMessagesPage from './pages/StaffMessagesPage'
import StaffEventsPage from './pages/StaffEventsPage'
import StaffMaterialsPage from './pages/StaffMaterialsPage'
import StaffSettingsPage from './pages/StaffSettingsPage'

const StaffLayout: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>('Dashboard')
  const [userRole, setUserRole] = useState<string>('staff')

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setUserRole(user.role)
      } catch (e) {
        console.error('Failed to parse user', e)
      }
    }
  }, [])

  const renderContent = () => {
    switch (selectedTab) {
      case 'Dashboard':
        return <StaffOverview />
      case 'Orders':
        return <StaffOrdersPage />
      case 'Messages':
        return <StaffMessagesPage />
      case 'Materials':
        return <StaffMaterialsPage />
      case 'Settings':
        return <StaffSettingsPage />
      case 'Events':
        return <StaffEventsPage />
      default:
        return <StaffOverview />
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <StaffNavbar />
      <div className="flex">
        <StaffLayoutSidebar selected={selectedTab} onSelect={setSelectedTab} />
        <div className="flex-1">
          <main className="p-6 max-w-7xl mx-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  )
}

export default StaffLayout
