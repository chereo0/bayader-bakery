import React, { useState, useEffect } from 'react'
import StaffSidebar from './StaffSidebar'
import SummaryCards from './SummaryCards'
import CurrentCustomerOrders from './OrdersTable'
import ProductionQueue from './ProductionQueue'
import DeliveryCoordination from './DeliveryCoordination'
import StaffNotifications from './StaffNotifications'
import InventoryAlertsPage from './InventoryAlertsPage'
import MessagingPage from './MessagingPage'
import StaffSettingsPage from './StaffSettingsPage'
import QuickActions from './QuickActions'
import OrdersManagementPage from '../orders/OrdersManagementPage'

const API_BASE_URL = 'http://localhost:5000/api';

interface DashboardStats {
  newOrders: number
  inProduction: number
  readyForDispatch: number
}

interface DashboardData {
  summary: DashboardStats
  trends: {
    orders: number[]
    production: number[]
  }
}

const StaffDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>('Dashboard')
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (selectedTab === 'Dashboard') {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 60000); // Refresh every 60 seconds
      return () => clearInterval(interval);
    }
  }, [selectedTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
      }

      const result = await response.json();
      setDashboardData(result.data);
      setLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(message);
      setLoading(false);
    }
  };

  const DashboardContent = () => (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCards 
          title="New Orders" 
          value={dashboardData?.summary.newOrders || 0} 
          trend={dashboardData?.trends.orders || [0, 0, 0, 0, 0, 0]}
          loading={loading}
        />
        <SummaryCards 
          title="In Production" 
          value={dashboardData?.summary.inProduction || 0} 
          trend={dashboardData?.trends.production || [0, 0, 0, 0, 0, 0]}
          loading={loading}
        />
        <SummaryCards 
          title="Ready for Dispatch" 
          value={dashboardData?.summary.readyForDispatch || 0} 
          trend={[0, 0, 1, 1, 2, 3]}
          loading={loading}
        />
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

          {/* Quick Actions */}
          <QuickActions 
            onOrderAssigned={fetchDashboardData}
            onIssueReported={fetchDashboardData}
          />

          {/* Staff Notifications */}
          <StaffNotifications />
        </div>
      </div>
    </div>
  )

  const OrdersContent = () => (
    <OrdersManagementPage />
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

