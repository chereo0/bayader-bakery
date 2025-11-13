import React, { useState, useEffect } from 'react'

const API_BASE_URL = 'http://localhost:5000/api';

interface ProductionItem {
  _id: string
  productName: string
  category: string
  quantity: number
  status: 'pending' | 'baking' | 'decorating' | 'quality_check' | 'ready' | 'completed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  assignedToName?: string
  orderNumber?: string
  specialInstructions?: string
  createdAt: string
  estimatedCompletionTime: string
}

interface Stats {
  byStatus: { [key: string]: number }
  byPriority: { [key: string]: number }
  totalPending: number
  totalOverdue: number
  onTime: number
}

const ProductionQueue: React.FC = () => {
  const [queue, setQueue] = useState<ProductionItem[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'pending' | 'baking' | 'decorating' | 'quality_check' | 'ready'>('all')

  const token = localStorage.getItem('token');

  // Fetch queue on mount
  useEffect(() => {
    fetchQueue();
    fetchStats();
    const interval = setInterval(() => {
      fetchQueue();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [filter]);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const url = filter === 'all' 
        ? `${API_BASE_URL}/production?page=1&limit=50`
        : `${API_BASE_URL}/production?status=${filter}&page=1&limit=50`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch production queue: ${response.statusText}`);
      }

      const result = await response.json();
      setQueue(result.data || []);
      setLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load production queue';
      setError(message);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/production/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setStats(result.data || null);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const markAsReady = async (id: string) => {
    try {
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/production/${id}/mark-ready`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes: '' })
      });

      if (!response.ok) {
        throw new Error('Failed to mark as ready');
      }

      setSuccess('Task marked as ready!');
      setTimeout(() => setSuccess(null), 3000);
      fetchQueue();
      fetchStats();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error marking task as ready';
      setError(message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/production/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setSuccess('Status updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
      fetchQueue();
      fetchStats();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating status';
      setError(message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === queue.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(queue.map(item => item._id)));
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: { [key: string]: string } = {
      'pending': 'bg-gray-100 text-gray-800',
      'baking': 'bg-orange-100 text-orange-800',
      'decorating': 'bg-purple-100 text-purple-800',
      'quality_check': 'bg-blue-100 text-blue-800',
      'ready': 'bg-green-100 text-green-800',
      'completed': 'bg-gray-200 text-gray-700'
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  };

  const getPriorityBadge = (priority: string) => {
    const styles: { [key: string]: string } = {
      'low': 'text-gray-500',
      'normal': 'text-blue-500',
      'high': 'text-orange-500',
      'urgent': 'text-red-600 font-bold'
    }
    return styles[priority] || 'text-gray-500'
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500">
            <div className="text-3xl font-bold text-orange-600">{stats.byStatus.baking || 0}</div>
            <div className="text-sm text-gray-600">Baking</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
            <div className="text-3xl font-bold text-purple-600">{stats.byStatus.decorating || 0}</div>
            <div className="text-sm text-gray-600">Decorating</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <div className="text-3xl font-bold text-green-600">{stats.byStatus.ready || 0}</div>
            <div className="text-sm text-gray-600">Ready</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
            <div className="text-3xl font-bold text-red-600">{stats.totalOverdue}</div>
            <div className="text-sm text-gray-600">Overdue</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
            <div className="text-3xl font-bold text-blue-600">{stats.totalPending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">✕</button>
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex justify-between items-center">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="text-green-700 hover:text-green-900">✕</button>
        </div>
      )}

      {/* Queue List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-[#5E372E]">Production Queue</h3>
          <div className="flex gap-2">
            {['all', 'pending', 'baking', 'decorating', 'quality_check', 'ready'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-[#5E372E] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <svg className="w-8 h-8 animate-spin mx-auto text-[#5E372E] mb-4" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
            <p className="text-gray-600">Loading production queue...</p>
          </div>
        ) : queue.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 text-lg">No production tasks in this status</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {/* Select All Header */}
            <div className="p-4 bg-gray-50 flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedItems.size === queue.length && queue.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-[#5E372E] border-gray-300 rounded focus:ring-[#5E372E]"
              />
              <span className="text-sm font-medium text-gray-700">
                {selectedItems.size} of {queue.length} selected
              </span>
            </div>

            {/* Queue Items */}
            {queue.map((item) => (
              <div
                key={item._id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item._id)}
                    onChange={() => handleSelectItem(item._id)}
                    className="w-4 h-4 text-[#5E372E] border-gray-300 rounded focus:ring-[#5E372E]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-[#5E372E]">{item.productName}</p>
                      <span className={`text-xs font-bold ${getPriorityBadge(item.priority)}`}>
                        [{item.priority.toUpperCase()}]
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {item.category} • Qty: {item.quantity} units
                      {item.orderNumber && ` • Order: ${item.orderNumber}`}
                      {item.assignedToName && ` • Assigned to: ${item.assignedToName}`}
                    </p>
                    {item.specialInstructions && (
                      <p className="text-xs text-gray-500 mt-1 italic">📝 {item.specialInstructions}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' ')}
                  </span>

                  {/* Status Progression Buttons */}
                  {item.status !== 'completed' && item.status !== 'ready' && (
                    <select
                      value={item.status}
                      onChange={(e) => updateStatus(item._id, e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:border-[#5E372E] transition-colors"
                    >
                      <option value="pending">Pending</option>
                      <option value="baking">Baking</option>
                      <option value="decorating">Decorating</option>
                      <option value="quality_check">Quality Check</option>
                      <option value="ready">Ready</option>
                    </select>
                  )}

                  {item.status !== 'ready' && item.status !== 'completed' && (
                    <button
                      onClick={() => markAsReady(item._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Mark Ready
                    </button>
                  )}

                  {item.status === 'ready' && (
                    <button
                      disabled
                      className="px-4 py-2 bg-green-200 text-green-700 rounded-md text-sm font-medium cursor-not-allowed"
                    >
                      ✓ Ready
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductionQueue

