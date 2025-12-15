import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader } from "lucide-react";
import Toast from "./Toast";

export default function CustomOrderFormPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(
    null
  );

  const [formData, setFormData] = useState({
    description: "",
    quantity: 1,
    budget: "",
    deliveryDate: "",
    specialRequests: "",
    name: "",
    phone: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "quantity" ? Math.max(1, parseInt(value) || 1) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.description.trim()) {
      setToast({ type: "error", message: "Please describe your custom order" });
      return;
    }

    if (!formData.deliveryDate) {
      setToast({ type: "error", message: "Please select a delivery date" });
      return;
    }

    if (formData.quantity < 1) {
      setToast({ type: "error", message: "Quantity must be at least 1" });
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/custom-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          description: formData.description,
          quantity: formData.quantity,
          budget: formData.budget ? parseFloat(formData.budget) : undefined,
          deliveryDate: formData.deliveryDate,
          specialRequests: formData.specialRequests,
          name: formData.name,
          phone: formData.phone,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit custom order");
      }

      setToast({
        type: "success",
        message: "Custom order submitted successfully! Check your email.",
      });

      // Reset form
      setFormData({
        description: "",
        quantity: 1,
        budget: "",
        deliveryDate: "",
        specialRequests: "",
        name: "",
        phone: "",
      });

      // Redirect after success
      setTimeout(() => {
        navigate("/my-custom-orders");
      }, 1500);
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to submit",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🍰 Custom Sweets Order
          </h1>
          <p className="text-gray-600">
            Tell us your dream cake or sweets creation. Our pastry team will
            work with you to bring it to life!
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-amber-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                📝 Describe Your Order *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="E.g., A 3-layer chocolate cake with strawberry filling, personalised with the name 'Sarah' in gold lettering"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                rows={4}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Include flavors, colors, decorations, and any special requirements
              </p>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                🎂 Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                title="Enter quantity"
                placeholder="Enter quantity"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>

            {/* Delivery Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                📅 Delivery Date *
              </label>
              <input
                type="date"
                name="deliveryDate"
                value={formData.deliveryDate}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                title="Select delivery date"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Please allow at least 3 days for custom orders
              </p>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                💰 Budget (Optional)
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="Leave empty if unsure"
                step="0.01"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Our team will contact you with a quote
              </p>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  👤 Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name (optional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  ☎️ Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Your phone (optional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                ✨ Special Requests (Optional)
              </label>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleChange}
                placeholder="Any allergies, dietary requirements, or other notes?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">ℹ️ Next Steps:</span> We'll review
                your request and send you a quote via email. Once you approve,
                we'll confirm your order and provide a delivery date.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Custom Order Request"
              )}
            </button>
          </form>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ❓ Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="font-semibold text-gray-900 mb-1">
                How long does a custom order take?
              </p>
              <p className="text-gray-600 text-sm">
                We typically need 3-7 days depending on complexity. Rush orders
                may be available with additional fees.
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="font-semibold text-gray-900 mb-1">
                Can I make changes to my order?
              </p>
              <p className="text-gray-600 text-sm">
                Yes, you can modify details until our team starts preparing it.
                We'll confirm any changes before beginning.
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="font-semibold text-gray-900 mb-1">
                What if I need a rush order?
              </p>
              <p className="text-gray-600 text-sm">
                Contact us directly! We may be able to expedite your order for
                a rush fee. Call or message us through the app.
              </p>
            </div>
          </div>
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
