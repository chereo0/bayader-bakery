import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ChevronRight, Loader } from "lucide-react";
import Toast from "./Toast";

interface CustomOrder {
  _id: string;
  description: string;
  quantity: number;
  budget?: number;
  deliveryDate: string;
  status: string;
  estimatedPrice?: number;
  createdAt: string;
}

const statusColors: Record<string, { bg: string; text: string; badge: string }> =
  {
    pending: { bg: "bg-yellow-50", text: "text-yellow-900", badge: "bg-yellow-200" },
    approved: { bg: "bg-green-50", text: "text-green-900", badge: "bg-green-200" },
    "in-progress": {
      bg: "bg-blue-50",
      text: "text-blue-900",
      badge: "bg-blue-200",
    },
    rejected: { bg: "bg-red-50", text: "text-red-900", badge: "bg-red-200" },
    completed: { bg: "bg-purple-50", text: "text-purple-900", badge: "bg-purple-200" },
  };

export default function MyCustomOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(
    null
  );

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/custom-orders/me", {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "approved":
        return "✅";
      case "in-progress":
        return "👨‍🍳";
      case "rejected":
        return "❌";
      case "completed":
        return "🎉";
      default:
        return "📋";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600 mb-4"></div>
          <p className="text-gray-600">Loading your custom orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">🍰 My Custom Orders</h1>
            <button
              onClick={() => navigate("/custom-order")}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Order
            </button>
          </div>
          <p className="text-gray-600">
            Track and manage your custom sweets orders
          </p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <div className="text-5xl mb-4">🍰</div>
            <p className="text-gray-600 text-lg mb-2">No custom orders yet</p>
            <p className="text-gray-500 mb-6">
              Create your first custom sweets order to get started
            </p>
            <button
              onClick={() => navigate("/custom-order")}
              className="inline-flex items-center px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Custom Order
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const colors =
                statusColors[order.status] ||
                statusColors["pending"];
              return (
                <div
                  key={order._id}
                  className={`${colors.bg} rounded-lg border border-gray-200 p-6 transition-all hover:shadow-md`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Status Badge & Title */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`${colors.badge} ${colors.text} px-3 py-1 rounded-full text-sm font-semibold`}>
                          {getStatusIcon(order.status)} {order.status.replace('-', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Description */}
                      <p className={`font-semibold ${colors.text} mb-3 line-clamp-2`}>
                        {order.description}
                      </p>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 font-medium">
                            Quantity
                          </p>
                          <p className={`text-lg font-bold ${colors.text}`}>
                            {order.quantity}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-600 font-medium">
                            Budget
                          </p>
                          <p className={`text-lg font-bold ${colors.text}`}>
                            {order.budget ? `$${order.budget.toFixed(2)}` : "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-600 font-medium">
                            Quoted Price
                          </p>
                          <p className={`text-lg font-bold ${colors.text}`}>
                            {order.estimatedPrice
                              ? `$${order.estimatedPrice.toFixed(2)}`
                              : "Pending"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-600 font-medium">
                            Delivery Date
                          </p>
                          <p className={`text-lg font-bold ${colors.text}`}>
                            {new Date(order.deliveryDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* View Button */}
                    <button
                      onClick={() =>
                        navigate(`/custom-order/${order._id}`)
                      }
                      className="flex-shrink-0 ml-4 p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title="View details"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            📧 Email Notifications
          </h3>
          <p className="text-blue-800 text-sm">
            We'll send you email updates whenever your custom order status
            changes. Make sure to check your email for quotes and confirmation
            from our pastry team!
          </p>
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
