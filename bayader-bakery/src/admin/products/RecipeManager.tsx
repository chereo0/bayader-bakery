import React, { useState, useEffect } from 'react';
import { Material, materialService } from '../services/materialService';

export interface RecipeItem {
  material: string; // Material ID
  quantity: number;
}

export interface RecipeItemWithDetails extends RecipeItem {
  materialName?: string;
  materialUnit?: string;
}

interface Props {
  recipe: RecipeItem[];
  onChange: (recipe: RecipeItem[]) => void;
  disabled?: boolean;
}

const RecipeManager: React.FC<Props> = ({ recipe, onChange, disabled = false }) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load materials on component mount
  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await materialService.getMaterials({ 
        isActive: true, 
        limit: 100, 
        sort: 'name' 
      });
      setMaterials(response.data.materials);
    } catch (error) {
      console.error('Failed to load materials:', error);
      setError('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const addRecipeItem = () => {
    if (materials.length === 0) {
      alert('No materials available. Please add materials first.');
      return;
    }
    
    const newItem: RecipeItem = {
      material: materials[0]._id,
      quantity: 1,
    };
    onChange([...recipe, newItem]);
  };

  const updateRecipeItem = (index: number, field: keyof RecipeItem, value: string | number) => {
    const updatedRecipe = recipe.map((item, i) => 
      i === index ? { ...item, [field]: field === 'quantity' ? Number(value) : value } : item
    );
    onChange(updatedRecipe);
  };

  const removeRecipeItem = (index: number) => {
    const updatedRecipe = recipe.filter((_, i) => i !== index);
    onChange(updatedRecipe);
  };

  const getSelectedMaterial = (materialId: string) => {
    return materials.find(m => m._id === materialId);
  };

  if (loading) {
    return (
      <div className="border border-gray-300 rounded-lg p-4">
        <div className="text-sm text-gray-500">Loading materials...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-300 rounded-lg p-4 bg-red-50">
        <div className="text-sm text-red-600">{error}</div>
        <button 
          onClick={loadMaterials}
          className="mt-2 text-xs text-red-700 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium">Recipe (Materials & Quantities)</label>
        <button
          type="button"
          onClick={addRecipeItem}
          disabled={disabled || materials.length === 0}
          className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + Add Material
        </button>
      </div>

      {materials.length === 0 ? (
        <div className="text-center py-4 text-gray-500 text-sm">
          No materials available. 
          <a href="/admin/materials" className="text-[#5E372E] hover:underline ml-1">
            Add materials first
          </a>
        </div>
      ) : recipe.length === 0 ? (
        <div className="text-center py-4 text-gray-500 text-sm">
          No materials added to recipe yet. Click "Add Material" to start.
        </div>
      ) : (
        <div className="space-y-2">
          {recipe.map((item, index) => {
            const selectedMaterial = getSelectedMaterial(item.material);
            return (
              <div key={index} className="flex items-center gap-2 p-2 border border-gray-200 rounded">
                <div className="flex-1">
                  <select
                    title="Select Material"
                    value={item.material}
                    onChange={(e) => updateRecipeItem(index, 'material', e.target.value)}
                    disabled={disabled}
                    className="w-full border border-gray-300 px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#6b3f2f] focus:border-transparent disabled:bg-gray-100"
                  >
                    {materials.map(material => (
                      <option key={material._id} value={material._id}>
                        {material.name} ({material.unit})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="w-24">
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => updateRecipeItem(index, 'quantity', e.target.value)}
                    disabled={disabled}
                    className="w-full border border-gray-300 px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#6b3f2f] focus:border-transparent disabled:bg-gray-100"
                    placeholder="Qty"
                  />
                </div>

                {selectedMaterial && (
                  <div className="text-xs text-gray-500 w-8">
                    {selectedMaterial.unit}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => removeRecipeItem(index)}
                  disabled={disabled}
                  className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remove material"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {recipe.length > 0 && (
        <div className="mt-3 text-xs text-gray-600">
          <strong>Note:</strong> These materials will be automatically deducted from stock when orders are activated.
        </div>
      )}
    </div>
  );
};

export default RecipeManager;