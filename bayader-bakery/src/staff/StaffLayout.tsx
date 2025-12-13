import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import StaffNavbar from './StaffNavbar'
import StaffLayoutSidebar from './StaffLayoutSidebar'
import StaffOverview from './pages/StaffOverview'
import StaffOrdersPage from './pages/StaffOrdersPage'
import StaffMessagesPage from './pages/StaffMessagesPage'
import StaffEventsPage from './pages/StaffEventsPage'
import StaffMaterialsPage from './pages/StaffMaterialsPage'
import StaffSettingsPage from './pages/StaffSettingsPage'
import StaffNotificationsPage from './pages/StaffNotificationsPage'

const StaffLayout: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [userRole, setUserRole] = useState<string>('staff')

  // Get current tab from URL or default to 'Dashboard'
  const getTabFromPath = () => {
    const path = location.pathname
    if (path.includes('/staff/orders')) return 'Orders'
    if (path.includes('/staff/messages')) return 'Messages'
    if (path.includes('/staff/materials')) return 'Materials'
    if (path.includes('/staff/settings')) return 'Settings'
    if (path.includes('/staff/events')) return 'Events'
    if (path.includes('/staff/notifications')) return 'Notifications'
    return 'Dashboard'
  }

  const [selectedTab, setSelectedTab] = useState<string>(getTabFromPath())

  // Load user role
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

  // Update selectedTab when URL changes (e.g., on refresh)
  useEffect(() => {
    setSelectedTab(getTabFromPath())
  }, [location.pathname])

  // Handle tab selection and navigate to URL
  const handleTabSelect = (tab: string) => {
    setSelectedTab(tab)
    switch (tab) {
      case 'Orders':
        navigate('/staff/orders')
        break
      case 'Messages':
        navigate('/staff/messages')
        break
      case 'Materials':
        navigate('/staff/materials')
        break
      case 'Settings':
        navigate('/staff/settings')
        break
      case 'Events':
        navigate('/staff/events')
        break
      case 'Notifications':
        navigate('/staff/notifications')
        break
      default:
        navigate('/staff')
    }
  }

  // Apply dark mode based on localStorage theme and listen for changes
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    const htmlElement = document.documentElement
    if (savedTheme === 'dark') {
      htmlElement.classList.add('dark')
    } else {
      htmlElement.classList.remove('dark')
    }

    // Listen for storage changes (from other tabs/windows)
    const handleStorageChange = () => {
      const theme = localStorage.getItem('theme') || 'light'
      if (theme === 'dark') {
        htmlElement.classList.add('dark')
      } else {
        htmlElement.classList.remove('dark')
      }
    }

    // Listen for custom theme change event from Settings page
    const handleThemeChange = (event: any) => {
      const theme = event.detail?.theme || 'light'
      if (theme === 'dark') {
        htmlElement.classList.add('dark')
      } else {
        htmlElement.classList.remove('dark')
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('themeChanged', handleThemeChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('themeChanged', handleThemeChange)
    }
  }, [])

  const renderContent = () => {
    switch (selectedTab) {
      case 'Dashboard':
        return <StaffOverview onSelectTab={setSelectedTab} />
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
      case 'Notifications':
        return <StaffNotificationsPage />
      default:
        return <StaffOverview onSelectTab={setSelectedTab} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <StaffNavbar />
      <div className="flex">
        <StaffLayoutSidebar selected={selectedTab} onSelect={handleTabSelect} />
        <div className="flex-1 min-h-screen">
          <main className="p-6 max-w-7xl mx-auto w-full">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  )
}

export default StaffLayout
