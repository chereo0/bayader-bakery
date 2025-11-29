import React, { useEffect, useState } from 'react';
import { Material } from '../services/materialService';

interface Props {
  open: boolean;
  material?: Material | null;
  onSave: (materialData: any) => Promise<void>;
  onClose: () => void;
}

const UNIT_OPTIONS = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'g', label: 'Grams (g)' },
  { value: 'lb', label: 'Pounds (lb)' },
  { value: 'oz', label: 'Ounces (oz)' },
  { value: 'l', label: 'Liters (l)' },
  { value: 'ml', label: 'Milliliters (ml)' },
  { value: 'piece', label: 'Pieces' },
  { value: 'cup', label: 'Cups' },
  { value: 'tbsp', label: 'Tablespoons (tbsp)' },
  { value: 'tsp', label: 'Teaspoons (tsp)' },
];

const MaterialFormModal: React.FC<Props> = ({ open, material, onSave, onClose }) => {
  const getDefaultForm = () => ({
    name: '',
    unit: 'g',
    currentStock: 0,
    reorderLevel: 10,
    description: '',
    supplier: '',
    unitPrice: 0,
    isActive: true,
  });

  const [form, setForm] = useState(getDefaultForm());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (material) {
        setForm({
          name: material.name,
          unit: material.unit,
          currentStock: material.currentStock,
          reorderLevel: material.reorderLevel,
          description: material.description || '',
          supplier: material.supplier || '',
          unitPrice: material.unitPrice || 0,
          isActive: material.isActive,
        });
      } else {
        setForm(getDefaultForm());
      }
      setError(null);
    }
  }, [material, open]);

  if (!open) return null;

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate form
      if (!form.name.trim()) {
        throw new Error('Material name is required');
      }
      if (form.currentStock < 0) {
        throw new Error('Current stock cannot be negative');
      }
      if (form.reorderLevel < 0) {
        throw new Error('Reorder level cannot be negative');
      }

      // Prepare data for submission
      const submitData = {
        name: form.name.trim(),
        unit: form.unit,
        currentStock: Number(form.currentStock),
        reorderLevel: Number(form.reorderLevel),
        description: form.description.trim() || undefined,
        supplier: form.supplier.trim() || undefined,
        unitPrice: form.unitPrice > 0 ? Number(form.unitPrice) : undefined,
        isActive: form.isActive,
      };

      await onSave(submitData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-[#5E372E] mb-4">
          {material ? 'Edit Material' : 'Add New Material'}
        </h3>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Material Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Material Name *</label>
            <input
              required
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#6b3f2f] focus:border-transparent"
              placeholder="e.g., All-purpose flour"
            />
          </div>

          {/* Unit */}
          <div>
            <label className="block text-sm font-medium mb-1">Unit *</label>
            <select
              required
              value={form.unit}
              onChange={(e) => handleChange('unit', e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#6b3f2f] focus:border-transparent"
            >
              {UNIT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock */}
          <div>
            <label className="block text-sm font-medium mb-1">Current Stock</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.currentStock}
              onChange={(e) => handleChange('currentStock', e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#6b3f2f] focus:border-transparent"
            />
          </div>

          {/* Reorder Level */}
          <div>
            <label className="block text-sm font-medium mb-1">Reorder Level</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.reorderLevel}
              onChange={(e) => handleChange('reorderLevel', e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#6b3f2f] focus:border-transparent"
            />
          </div>

          {/* Unit Price */}
          <div>
            <label className="block text-sm font-medium mb-1">Unit Price ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.unitPrice}
              onChange={(e) => handleChange('unitPrice', e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#6b3f2f] focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          {/* Supplier */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Supplier</label>
            <input
              type="text"
              value={form.supplier}
              onChange={(e) => handleChange('supplier', e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#6b3f2f] focus:border-transparent"
              placeholder="e.g., ABC Food Distributors"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#6b3f2f] focus:border-transparent"
              rows={2}
              placeholder="Optional description or notes about this material"
            />
          </div>

          {/* Active Status */}
          {material && (
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Active</span>
              </label>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#6b3f2f] text-white rounded hover:bg-[#5a3226] transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : material ? 'Update Material' : 'Create Material'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaterialFormModal;