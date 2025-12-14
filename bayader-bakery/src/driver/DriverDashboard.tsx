import React, { useState, useEffect } from 'react'
import { toast, Toaster } from 'react-hot-toast'
import DriverSidebar from './DriverSidebar'
import DriverNavbar from './DriverNavbar'
import DeliveryDashboard from './DeliveryDashboard'
import MyDeliveriesPage from './MyDeliveriesPage'
import NotificationsPage from './NotificationsPage'
import MessagesPage from './MessagesPage'
import SettingsPage from './SettingsPage'
import { socketService } from '../services/socketService'
import { useAuth } from '../context/AuthContext'

const DriverDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>('Dashboard')
  const { token } = useAuth()
  
  // Connect to WebSocket on mount
  useEffect(() => {
    if (!token) return

    socketService.connect(token)
    
    // Define handlers
    const handleNotification = (notification: any) => {
      console.log('[DriverDashboard] Received notification:', notification)
      
      // Show toast based on notification type
      const toastOptions = {
        duration: 5000,
        position: 'top-right' as const,
      }
      
      switch (notification.type) {
        case 'alert':
          toast.error(notification.message, toastOptions)
          break
        case 'success':
          toast.success(notification.message, toastOptions)
          break
        default:
          toast(notification.message, toastOptions)
      }
    }
    
    const handleOrderUpdate = (order: any) => {
      console.log('[DriverDashboard] Order update:', order)
      toast(`Order #${order.orderNumber} updated`, {
        icon: '📦',
        duration: 4000,
      })
    }

    // Listen for events
    socketService.on('notification', handleNotification)
    socketService.on('order:update', handleOrderUpdate)
    
    // Cleanup on unmount
    return () => {
      socketService.off('notification', handleNotification)
      socketService.off('order:update', handleOrderUpdate)
      socketService.disconnect()
    }
  }, [token])

  const renderContent = () => {
    switch (selectedTab) {
      case 'Dashboard':
        return <DeliveryDashboard />
      case 'My Deliveries':
        return <MyDeliveriesPage />
      case 'Notifications':
        return <NotificationsPage />
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

