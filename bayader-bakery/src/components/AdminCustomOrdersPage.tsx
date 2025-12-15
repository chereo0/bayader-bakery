import { useState, useEffect } from "react";
import { Filter, Loader, Edit2, Trash2, Send } from "lucide-react";
import Toast from "./Toast";

interface CustomOrder {
  _id: string;
  customerId: {
    _id: string;
    name: string;
    email: string;
  };
  description: string;
  quantity: number;
  budget?: number;
  deliveryDate: string;
  status: string;
  estimatedPrice?: number;
  notes?: string;
  createdAt: string;
}

const statusOptions = [
  "pending",
  "approved",
  "in-progress",
  "rejected",
  "completed",
];

export default function AdminCustomOrdersPage() {
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<CustomOrder>>({});
  const [toast, setToast] = useState<{ type: string; message: string } | null>(
    null
  );

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const url =
        statusFilter === "all"
          ? "/api/custom-orders"
          : `/api/custom-orders?status=${statusFilter}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch custom orders");
      }

      const data = await response.json();
      setOrders(data.data || []);
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to load orders",
      });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (order: CustomOrder) => {
    setEditingId(order._id);
    setEditData({
      status: order.status,
      estimatedPrice: order.estimatedPrice,
      notes: order.notes,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async (orderId: string) => {
    try {
      const response = await fetch(`/api/custom-orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        throw new Error("Failed to update order");
      }

      const data = await response.json();
      setOrders(
        orders.map((o) => (o._id === orderId ? data.data : o))
      );

      setToast({ type: "success", message: "Order updated successfully" });
      setEditingId(null);
      setEditData({});
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to update",
      });
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to delete this order?")) {
      return;
    }

    try {
      const response = await fetch(`/api/custom-orders/${orderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete order");
      }

      setOrders(orders.filter((o) => o._id !== orderId));
      setToast({ type: "success", message: "Order deleted successfully" });
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to delete",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading custom orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🍰 Custom Orders Management
        </h1>
        <p className="text-gray-600 mb-8">
          Review and manage customer custom order requests
        </p>

        {/* Filter */}
        <div className="mb-6 flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            title="Filter orders by status"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Orders</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <span className="text-gray-600 text-sm">
            {orders.length} order{orders.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No custom orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Qty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Est. Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Delivery Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {order.customerId.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.customerId.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {order.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {order.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {order.budget ? `$${order.budget.toFixed(2)}` : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {editingId === order._id ? (
                          <input
                            type="number"
                            value={editData.estimatedPrice || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                estimatedPrice: parseFloat(e.target.value) || 0,
                              })
                            }
                            title="Enter estimated price"
                            placeholder="0.00"
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                            step="0.01"
                            min="0"
                          />
                        ) : (
                          order.estimatedPrice
                            ? `$${order.estimatedPrice.toFixed(2)}`
                            : "—"
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(order.deliveryDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === order._id ? (
                          <select
                            value={editData.status || order.status}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                status: e.target.value,
                              })
                            }
                            title="Select order status"
                            className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {editingId === order._id ? (
                            <>
                              <button
                                onClick={() => saveEdit(order._id)}
                                className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                                title="Save"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                title="Cancel"
                              >
                                ✕
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(order)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteOrder(order._id)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <Toast
          type={toast.type as "success" | "error" | "info"}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
