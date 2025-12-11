import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Driver {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isBusy: boolean;
}

interface AssignDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    _id: string;
    orderNumber: string;
    deliveryAddress?: {
      line1?: string;
      city?: string;
    };
  };
  onAssignSuccess: () => void;
}

export default function AssignDriverModal({ 
  isOpen, 
  onClose, 
  order, 
  onAssignSuccess 
}: AssignDriverModalProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchAvailableDrivers();
    }
  }, [isOpen]);

  const fetchAvailableDrivers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admin/drivers/available`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setDrivers(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch drivers');
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedDriver) {
      setError('Please select a driver');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_BASE_URL}/orders/${order._id}/assign-driver`,
        { driverId: selectedDriver },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      toast.success('Driver assigned successfully');
      onAssignSuccess();
      onClose();
      // Reset state
      setSelectedDriver('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to assign driver';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 dark:text-white">
          Assign Driver to Order #{order.orderNumber}
        </h2>

        {order.deliveryAddress && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <strong>Delivery Address:</strong><br />
              {order.deliveryAddress.line1}{order.deliveryAddress.city && `, ${order.deliveryAddress.city}`}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-green-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading drivers...</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                Select Driver *
              </label>
              <select
                title="Select a driver to assign"
                className="w-full p-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
              >
                <option value="">-- Choose Driver --</option>
                {drivers.map((driver) => (
                  <option key={driver._id} value={driver._id}>
                    {driver.name} {driver.isBusy ? '(Currently Busy)' : '(Available)'}
                  </option>
                ))}
              </select>
            </div>

            {drivers.length === 0 && (
              <p className="text-yellow-600 dark:text-yellow-400 mb-4 text-sm">
                ⚠️ No drivers available at the moment
              </p>
            )}

            {selectedDriver && drivers.find(d => d._id === selectedDriver) && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Selected Driver Details:
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  <strong>Phone:</strong> {drivers.find(d => d._id === selectedDriver)?.phone}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Email:</strong> {drivers.find(d => d._id === selectedDriver)?.email}
                </p>
              </div>
            )}
          </>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={submitting || !selectedDriver || loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Assigning...
              </>
            ) : (
              <>
                🚗 Assign Driver
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
