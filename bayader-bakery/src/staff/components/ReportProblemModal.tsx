import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ReportProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    _id: string;
    orderNumber: string;
    status?: string;
  };
  onReportSuccess: () => void;
}

export default function ReportProblemModal({ 
  isOpen, 
  onClose, 
  order, 
  onReportSuccess 
}: ReportProblemModalProps) {
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const issueTypes = [
    { value: 'missing_items', label: '📦 Missing Items', description: 'Items are missing from the order' },
    { value: 'delay', label: '⏰ Delay', description: 'Order preparation or delivery is delayed' },
    { value: 'quality_issue', label: '⚠️ Quality Issue', description: 'Product quality concerns' },
    { value: 'customer_change', label: '🔄 Customer Change Request', description: 'Customer wants to modify the order' },
    { value: 'other', label: '📝 Other Issue', description: 'Other problems not listed above' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!issueType || !description.trim()) {
      setError('Please select issue type and provide description');
      return;
    }

    if (description.trim().length < 10) {
      setError('Description must be at least 10 characters');
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/order-issues`,
        { 
          orderId: order._id, 
          issueType, 
          description: description.trim()
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      toast.success('Issue reported successfully. Admin has been notified.');
      onReportSuccess();
      onClose();
      // Reset form
      setIssueType('');
      setDescription('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to report issue';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setIssueType('');
      setDescription('');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
          <span className="text-red-600">⚠️</span>
          Report Order Issue
        </h2>

        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <strong>Order:</strong> #{order.orderNumber}
          </p>
          {order.status && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <strong>Status:</strong> <span className="capitalize">{order.status}</span>
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">
              Issue Type *
            </label>
            <select
              title="Select the type of issue"
              className="w-full p-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              required
            >
              <option value="">-- Select Issue Type --</option>
              {issueTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {issueType && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {issueTypes.find(t => t.value === issueType)?.description}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">
              Description *
            </label>
            <textarea
              title="Describe the issue in detail"
              placeholder="Please describe the issue in detail... (minimum 10 characters)"
              className="w-full p-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={10}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {description.length}/500 characters
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded mb-4">
            <p className="text-sm text-blue-600 dark:text-blue-400 flex items-start gap-2">
              <span className="text-lg">ℹ️</span>
              <span>
                Admin will be automatically notified of this issue via the messaging system. 
                They will review and respond as soon as possible.
              </span>
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !issueType || !description.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Reporting...
                </>
              ) : (
                <>
                  ⚠️ Report Issue
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
