import React, { useState } from 'react'
import Sidebar from './Sidebar'
import ProductsManagementPage from './products/ProductsManagementPage'
import AnalyticsDashboard from './AnalyticsDashboard'
import UsersManagementPage from './users/UsersManagementPage'
import InventoryPage from './inventory/InventoryPage'
import EventsPage from './events/EventsPage'
import DashboardStats from './DashboardStats'
import SalesChart from './SalesChart'
import OrdersTable from './OrdersTable'
import LowStock from './LowStock'
import EventRequests from './EventRequests'
import Feedbacks from './Feedbacks'
import QuickLinks from './QuickLinks'

const AdminDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>('Dashboard')

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <div className="flex">
        <Sidebar selected={selectedTab} onSelect={setSelectedTab} />
        <div className="flex-1">
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
                      <QuickLinks />
                    </div>
                  </div>
                </div>
              </>
            )}

            {selectedTab === 'Products' && (
              <ProductsManagementPage />
            )}

            {selectedTab === 'Analytics' && (
              <AnalyticsDashboard />
            )}

            {selectedTab === 'Inventory' && (
              <InventoryPage />
            )}

            {selectedTab === 'Events' && (
              <EventsPage />
            )}

            {selectedTab === 'Users' && (
              <UsersManagementPage />
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
