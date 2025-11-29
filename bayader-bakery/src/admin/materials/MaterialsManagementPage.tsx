import React, { useState, useEffect, useMemo } from 'react';
import { Material, materialService } from '../services/materialService';
import MaterialTable from './MaterialTable';
import MaterialFormModal from './MaterialFormModal';
import MaterialFilters from './MaterialFilters';

const MaterialsManagementPage: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);

  // Load materials
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

  // Filter materials client-side for instant feedback
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
    if (!confirm(`Are you sure you want to delete "${material.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await materialService.deleteMaterial(material._id);
      await loadMaterials(); // Reload to get updated list
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
      throw error; // Re-throw to let modal handle the error
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