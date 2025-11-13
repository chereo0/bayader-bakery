import React, { useState, useEffect } from 'react'

const API_BASE_URL = 'http://localhost:5000/api';

interface AlertItem {
  _id: string
  productName: string
  category: string
  currentStock: number
  threshold: number
  priority: 'critical' | 'warning' | 'low'
  status: 'active' | 'resolved' | 'acknowledged'
  createdAt: string
  replenishmentRequested?: boolean
}

const InventoryAlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const token = localStorage.getItem('token');

  // Fetch alerts on component mount
  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError('');

      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/inventory-alerts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }

      const data = await response.json();
      if (data.success) {
        setAlerts(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority: AlertItem['priority']) => {
    switch (priority) {
      case 'critical':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Critical</span>
      case 'warning':
        return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">Warning</span>
      default:
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Low</span>
    }
  }

  const reportIssue = async (alertId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory-alerts/${alertId}/acknowledge`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to report issue');

      setSuccess('Issue reported successfully');
      fetchAlerts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to report issue');
    }
  };

  const requestReplenishment = async (alertId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory-alerts/${alertId}/request-replenishment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to request replenishment');

      setSuccess('Replenishment request sent successfully');
      fetchAlerts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request replenishment');
    }
  };

  const exportReport = async () => {
    try {
      setExporting(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/inventory-alerts/report/export`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to export report');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-alerts-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess('Report exported successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const syncAlerts = async () => {
    try {
      setSyncing(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/inventory-alerts/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to sync alerts');

      const data = await response.json();
      setSuccess(`Sync complete: ${data.data.created} created, ${data.data.updated} updated`);
      fetchAlerts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync alerts');
    } finally {
      setSyncing(false);
    }
  };

  const renderAlerts = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-[#5E372E]">Inventory Alerts</h2>
            <div className="text-sm text-gray-600">
              {alerts.length} {alerts.length === 1 ? 'alert' : 'alerts'} found
            </div>
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">All inventory levels are healthy</p>
              <p className="text-gray-400 text-sm mt-2">No low stock alerts at this time</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert._id}
                  className={`border rounded-lg p-4 ${
                    alert.priority === 'critical'
                      ? 'border-red-200 bg-red-50'
                      : alert.priority === 'warning'
                      ? 'border-orange-200 bg-orange-50'
                      : 'border-yellow-200 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-[#5E372E]">{alert.productName}</h3>
                        {getPriorityBadge(alert.priority)}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span>Category: {alert.category}</span>
                        <span className="mx-2">•</span>
                        <span>Current Stock: <strong className={alert.currentStock <= alert.threshold ? 'text-red-600' : 'text-green-600'}>{alert.currentStock}</strong> units</span>
                        <span className="mx-2">•</span>
                        <span>Threshold: {alert.threshold} units</span>
                      </div>
                      {alert.status === 'acknowledged' && (
                        <div className="text-xs text-blue-600 mt-2">✓ Acknowledged on {new Date(alert.createdAt).toLocaleDateString()}</div>
                      )}
                      {alert.replenishmentRequested && (
                        <div className="text-xs text-purple-600 mt-2">📦 Replenishment requested</div>
                      )}
                    </div>
                    <div className="ml-4 flex gap-2">
                      <button
                        onClick={() => reportIssue(alert._id)}
                        disabled={loading}
                        className="px-4 py-2 bg-[#5E372E] text-white rounded-md hover:bg-[#6b453f] disabled:opacity-50 transition-colors text-sm font-medium"
                      >
                        Report Issue
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#5E372E] mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={async () => {
                const alertId = alerts[0]?._id;
                if (alertId) await requestReplenishment(alertId);
              }}
              disabled={syncing || alerts.length === 0}
              className="px-4 py-3 border-2 border-[#5E372E] text-[#5E372E] rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2"
            >
              {syncing ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Request Stock Replenishment
                </>
              )}
            </button>
            <button
              onClick={exportReport}
              disabled={exporting}
              className="px-4 py-3 border-2 border-[#5E372E] text-[#5E372E] rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2"
            >
              {exporting ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Alert Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">✕</button>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex justify-between items-center">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="text-green-700 hover:text-green-900">✕</button>
          </div>
        )}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="w-12 h-12 animate-spin mx-auto text-[#5E372E] mb-4" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
            <p className="text-gray-600">Loading alerts...</p>
          </div>
        ) : (
          renderAlerts()
        )}
      </div>
    </div>
  );
}

export default InventoryAlertsPage

