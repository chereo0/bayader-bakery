import React, { useState, useEffect, useMemo } from 'react';
import { Material, materialService } from '../services/materialService';

// Temporary inline components to test the page functionality
interface MaterialFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  isActiveFilter: boolean | undefined;
  onIsActiveFilterChange: (isActive: boolean | undefined) => void;
}

const MaterialFilters: React.FC<MaterialFiltersProps> = ({
  search,
  onSearchChange,
  isActiveFilter,
  onIsActiveFilterChange,
}) => (
  <div className="flex flex-col sm:flex-row gap-3">
    <input
      type="text"
      placeholder="Search materials..."
      value={search}
      onChange={(e) => onSearchChange(e.target.value)}
      className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6b3f2f]"
    />
    <select
      title="Filter by Status"
      value={isActiveFilter === undefined ? 'all' : isActiveFilter.toString()}
      onChange={(e) => {
        const value = e.target.value;
        onIsActiveFilterChange(value === 'all' ? undefined : value === 'true');
      }}
      className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6b3f2f]"
    >
      <option value="all">All Materials</option>
      <option value="true">Active Only</option>
      <option value="false">Inactive Only</option>
    </select>
  </div>
);

interface MaterialTableProps {
  materials: Material[];
  onEdit: (material: Material) => void;
  onDelete: (material: Material) => void;
  onStockAdjustment: (material: Material, adjustment: number) => void;
}

const MaterialTable: React.FC<MaterialTableProps> = ({ materials, onEdit, onDelete, onStockAdjustment }) => {
  if (materials.length === 0) {
    return (
      <div className="bg-white p-8 rounded shadow-sm text-center">
        <p className="text-gray-500">No materials found. Create your first material to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr className="text-sm text-gray-500">
              <th className="py-3 px-4 font-medium">Material Name</th>
              <th className="py-3 px-4 font-medium">Unit</th>
              <th className="py-3 px-4 font-medium">Current Stock</th>
              <th className="py-3 px-4 font-medium">Reorder Level</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {materials.map(material => (
              <tr key={material._id} className="border-t hover:bg-neutral-50 transition">
                <td className="py-3 px-4 font-medium">{material.name}</td>
                <td className="py-3 px-4 text-sm">{material.unit}</td>
                <td className="py-3 px-4">
                  <span className={`font-medium ${material.isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                    {material.currentStock}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">{material.reorderLevel}</td>
                <td className="py-3 px-4">
                  {!material.isActive ? (
                    <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs">Inactive</span>
                  ) : material.isLowStock ? (
                    <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs">Low Stock</span>
                  ) : (
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">Active</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => onEdit(material)} className="text-sm text-[#5E372E] hover:underline">
                      Edit
                    </button>
                    <button onClick={() => onDelete(material)} className="text-sm text-red-600 hover:underline">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface MaterialFormModalProps {
  open: boolean;
  material?: Material | null;
  onSave: (materialData: any) => Promise<void>;
  onClose: () => void;
}

const MaterialFormModal: React.FC<MaterialFormModalProps> = ({ open, material, onSave, onClose }) => {
  const [form, setForm] = useState({
    name: '',
    unit: 'g',
    currentStock: 0,
    reorderLevel: 10,
    description: '',
    supplier: '',
    unitPrice: 0,
    isActive: true,
  });
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
        setForm({
          name: '',
          unit: 'g',
          currentStock: 0,
          reorderLevel: 10,
          description: '',
          supplier: '',
          unitPrice: 0,
          isActive: true,
        });
      }
      setError(null);
    }
  }, [material, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSave({
        name: form.name.trim(),
        unit: form.unit,
        currentStock: Number(form.currentStock),
        reorderLevel: Number(form.reorderLevel),
        description: form.description.trim() || undefined,
        supplier: form.supplier.trim() || undefined,
        unitPrice: form.unitPrice > 0 ? Number(form.unitPrice) : undefined,
        isActive: form.isActive,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-lg font-medium text-[#5E372E] mb-4">
          {material ? 'Edit Material' : 'Add New Material'}
        </h3>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Material Name *</label>
            <input
              required
              type="text"
              title="Material Name"
              placeholder="Enter material name"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#6b3f2f]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Unit *</label>
            <select
              required
              title="Unit of Measurement"
              value={form.unit}
              onChange={(e) => setForm(prev => ({ ...prev, unit: e.target.value }))}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#6b3f2f]"
            >
              <option value="kg">Kilograms (kg)</option>
              <option value="g">Grams (g)</option>
              <option value="lb">Pounds (lb)</option>
              <option value="oz">Ounces (oz)</option>
              <option value="l">Liters (l)</option>
              <option value="ml">Milliliters (ml)</option>
              <option value="piece">Pieces</option>
              <option value="cup">Cups</option>
              <option value="tbsp">Tablespoons (tbsp)</option>
              <option value="tsp">Teaspoons (tsp)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Current Stock</label>
              <input
                type="number"
                min="0"
                step="0.01"
                title="Current Stock"
                placeholder="0.00"
                value={form.currentStock}
                onChange={(e) => setForm(prev => ({ ...prev, currentStock: Number(e.target.value) }))}
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#6b3f2f]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reorder Level</label>
              <input
                type="number"
                min="0"
                step="0.01"
                title="Reorder Level"
                placeholder="10"
                value={form.reorderLevel}
                onChange={(e) => setForm(prev => ({ ...prev, reorderLevel: Number(e.target.value) }))}
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#6b3f2f]"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#6b3f2f] text-white rounded hover:bg-[#5a3226] disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : material ? 'Update Material' : 'Create Material'}
          </button>
        </div>
      </form>
    </div>
  );
};

const MaterialsManagementPage: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await materialService.getMaterials({
        search: search || undefined,
        isActive: isActiveFilter,
        limit: 50,
        sort: 'name',
      });
      setMaterials(response.data.materials);
    } catch (error) {
      console.error('Failed to load materials:', error);
      setError('Failed to load materials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, [search, isActiveFilter]);

  const filteredMaterials = useMemo(() => {
    return materials.filter(material => {
      if (search && !material.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (isActiveFilter !== undefined && material.isActive !== isActiveFilter) {
        return false;
      }
      return true;
    });
  }, [materials, search, isActiveFilter]);

  const handleEdit = (material: Material) => {
    setEditing(material);
    setModalOpen(true);
  };

  const handleDelete = async (material: Material) => {
    if (!confirm(`Are you sure you want to delete "${material.name}"?`)) {
      return;
    }

    try {
      await materialService.deleteMaterial(material._id);
      await loadMaterials();
    } catch (error) {
      console.error('Failed to delete material:', error);
      alert('Failed to delete material. It may be used in product recipes.');
    }
  };

  const handleSave = async (materialData: any) => {
    try {
      if (editing) {
        await materialService.updateMaterial(editing._id, materialData);
      } else {
        await materialService.createMaterial(materialData);
      }
      
      setModalOpen(false);
      setEditing(null);
      await loadMaterials();
    } catch (error) {
      console.error('Failed to save material:', error);
      throw error;
    }
  };

  const handleStockAdjustment = async (material: Material, adjustment: number) => {
    try {
      await materialService.adjustMaterialStock(material._id, adjustment, 'Manual adjustment');
      await loadMaterials();
    } catch (error) {
      console.error('Failed to adjust stock:', error);
      alert('Failed to adjust stock. Please try again.');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#5E372E] mb-2">Materials Management</h1>
        <p className="text-[#6b4f45]">Manage your bakery materials, track stock levels, and monitor usage.</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <MaterialFilters
          search={search}
          onSearchChange={setSearch}
          isActiveFilter={isActiveFilter}
          onIsActiveFilterChange={setIsActiveFilter}
        />
        
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="bg-[#6b3f2f] text-white px-4 py-2 rounded hover:bg-[#5a3226] transition-colors"
        >
          Add New Material
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-[#6b4f45]">Loading materials...</div>
        </div>
      ) : (
        <MaterialTable
          materials={filteredMaterials}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStockAdjustment={handleStockAdjustment}
        />
      )}

      <MaterialFormModal
        open={modalOpen}
        material={editing}
        onSave={handleSave}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
      />
    </div>
  );
};

export default MaterialsManagementPage;