import React, { useState } from 'react'
import Sidebar from './Sidebar'
import ProductsManagementPage from './products/ProductsManagementPage'
import MaterialsManagementPage from './materials/MaterialsManagementPageSelfContained';
import AnalyticsDashboard from './AnalyticsDashboard'
import UsersManagementPage from './users/UsersManagementPage'
import InventoryPage from './inventory/InventoryPage'
import AdminEventsPage from './events/AdminEventsPage'
import OrdersManagementPage from './orders/OrdersManagementPage'
import DriversManagementPage from './drivers/DriversManagementPage'
import AdminMessagesPage from './AdminMessagesPage'
import AdminNotificationsPage from './AdminNotificationsPage'
import DashboardStats from './DashboardStats'
import SalesChart from './SalesChart'
import OrdersTable from './OrdersTable'
import LowStock from './LowStock'
import LowStockMaterials from './materials/LowStockMaterials'
import EventRequests from './EventRequests'
import Feedbacks from './Feedbacks'
import QuickLinks from './QuickLinks'
import ToastProvider from '../components/ui/Toast'

const AdminDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>('Dashboard')

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <div className="flex">
        <Sidebar selected={selectedTab} onSelect={setSelectedTab} />
        <div className="flex-1">
          <ToastProvider>
          {/* use the main site Header for top navigation; removed duplicate admin Navbar */}
          <main className="p-6 max-w-7xl mx-auto">
            {selectedTab === 'Dashboard' && (
              <>
                <DashboardStats />

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <SalesChart />
                    <div className="mt-6">
                      <OrdersTable />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <LowStock />
                    <LowStockMaterials />
                    <EventRequests />
                    <Feedbacks />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <div className="bg-white p-4 rounded shadow-sm">
                        <h3 className="text-lg font-medium text-[#5E372E]">Cakes & Pastries</h3>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <img src="/images/cakes.jpg" alt="cakes" className="w-full h-36 object-cover rounded" />
                          <img src="/images/pastries.jpg" alt="pastries" className="w-full h-36 object-cover rounded" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <QuickLinks onNavigate={setSelectedTab} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {selectedTab === 'Products' && (
              <ProductsManagementPage />
            )}

            {selectedTab === 'Materials' && (
              <MaterialsManagementPage />
            )}

            {selectedTab === 'Analytics' && (
              <AnalyticsDashboard />
            )}

            {selectedTab === 'Inventory' && (
              <InventoryPage />
            )}

            {selectedTab === 'Events' && (
              <AdminEventsPage />
            )}

            {selectedTab === 'Users' && (
              <UsersManagementPage />
            )}

            {selectedTab === 'Orders' && (
              <OrdersManagementPage />
            )}

            {selectedTab === 'Drivers' && (
              <DriversManagementPage />
            )}

            {selectedTab === 'Messages' && (
              <AdminMessagesPage />
            )}

            {selectedTab === 'Notifications' && (
              <AdminNotificationsPage />
            )}
          </main>
          </ToastProvider>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
