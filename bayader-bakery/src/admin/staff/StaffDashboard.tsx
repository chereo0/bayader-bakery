import React, { useState } from 'react'
import StaffSidebar from './StaffSidebar'
import SummaryCards from './SummaryCards'
import CurrentCustomerOrders from './OrdersTable'
import ProductionQueue from './ProductionQueue'
import DeliveryCoordination from './DeliveryCoordination'
import StaffNotifications from './StaffNotifications'
import InventoryAlertsPage from './InventoryAlertsPage'
import MessagingPage from './MessagingPage'
import StaffSettingsPage from './StaffSettingsPage'
import { summaryStats } from './data'

const StaffDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>('Dashboard')

  const DashboardContent = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCards title="New Orders" value={summaryStats.newOrders} trend={[8, 10, 9, 12, 11, 12]} />
        <SummaryCards title="In Production" value={summaryStats.inProduction} trend={[15, 18, 20, 19, 20, 20]} />
        <SummaryCards title="Ready for Dispatch" value={summaryStats.readyForDispatch} trend={[1, 2, 3, 2, 3, 3]} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2 columns wide on desktop */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Customer Orders */}
          <CurrentCustomerOrders />

          {/* Production Queue */}
          <ProductionQueue />
        </div>

        {/* Right Column - 1 column wide on desktop */}
        <div className="space-y-6">
          {/* Delivery Coordination */}
          <DeliveryCoordination />

          {/* Inventory & Issue Reporting */}
          <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
            <h3 className="text-lg font-semibold text-[#5E372E]">Quick Actions</h3>
            <button className="w-full px-4 py-3 bg-[#5E372E] text-white rounded-md hover:bg-[#6b453f] transition-colors font-medium flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Assign Ready Order
            </button>
            <button className="w-full px-4 py-3 border-2 border-[#5E372E] text-[#5E372E] rounded-md hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Report Production Issue
            </button>
          </div>

          {/* Staff Notifications */}
          <StaffNotifications />
        </div>
      </div>
    </div>
  )

  const OrdersContent = () => (
    <div className="bg-white rounded-lg shadow-sm min-h-[600px] p-6">
      <h2 className="text-2xl font-semibold text-[#5E372E] mb-6">Orders Management</h2>
      <CurrentCustomerOrders />
    </div>
  )

  const ProductionContent = () => (
    <div className="bg-white rounded-lg shadow-sm min-h-[600px] p-6">
      <h2 className="text-2xl font-semibold text-[#5E372E] mb-6">Production Management</h2>
      <ProductionQueue />
    </div>
  )

  const InventoryAlertsContent = () => (
    <InventoryAlertsPage />
  )

  const MessagingContent = () => (
    <MessagingPage />
  )

  const StaffSettingsContent = () => (
    <StaffSettingsPage />
  )

  const renderContent = () => {
    switch (selectedTab) {
      case 'Dashboard':
        return <DashboardContent />
      case 'Orders':
        return <OrdersContent />
      case 'Production':
        return <ProductionContent />
      case 'Inventory Alerts':
        return <InventoryAlertsContent />
      case 'Messaging':
        return <MessagingContent />
      case 'Staff Settings':
        return <StaffSettingsContent />
      default:
        return <DashboardContent />
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <div className="flex">
        <StaffSidebar selected={selectedTab} onSelect={setSelectedTab} />
        <div className="flex-1">
          <main className="p-6 max-w-7xl mx-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  )
}

export default StaffDashboard

