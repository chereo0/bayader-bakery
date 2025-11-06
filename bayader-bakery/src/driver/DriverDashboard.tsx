import React, { useState } from 'react'
import DriverSidebar from './DriverSidebar'
import DriverNavbar from './DriverNavbar'
import DeliveryDashboard from './DeliveryDashboard'
import MyDeliveriesPage from './MyDeliveriesPage'
import RoutePlannerPage from './RoutePlannerPage'
import MessagesPage from './MessagesPage'
import SettingsPage from './SettingsPage'

const DriverDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>('Dashboard')

  const renderContent = () => {
    switch (selectedTab) {
      case 'Dashboard':
        return <DeliveryDashboard />
      case 'My Deliveries':
        return <MyDeliveriesPage />
      case 'Route Planner':
        return <RoutePlannerPage />
      case 'Messages':
        return <MessagesPage />
      case 'Settings':
        return <SettingsPage />
      default:
        return <DeliveryDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <DriverNavbar />
      <div className="flex">
        <DriverSidebar selected={selectedTab} onSelect={setSelectedTab} />
        <div className="flex-1">
          <main className="p-6 max-w-7xl mx-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  )
}

export default DriverDashboard

