import React, { useEffect, useState } from 'react';
import { Material, materialService } from '../services/materialService';

const LowStockMaterials: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLowStockMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await materialService.getLowStockMaterials(5);
      setMaterials(response.data);
    } catch (error) {
      console.error('Failed to load low stock materials:', error);
      setError('Failed to load low stock materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLowStockMaterials();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-4 rounded shadow-sm">
        <h3 className="text-lg font-medium text-[#5E372E] mb-3">Low Stock Materials</h3>
        <div className="text-center py-4">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded shadow-sm">
        <h3 className="text-lg font-medium text-[#5E372E] mb-3">Low Stock Materials</h3>
        <div className="text-center py-4">
          <div className="text-red-500 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-[#5E372E]">Low Stock Materials</h3>
        {materials.length > 0 && (
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
            {materials.length} Alert{materials.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {materials.length === 0 ? (
        <div className="text-center py-4">
          <div className="text-gray-500 text-sm mb-2">🎉 All materials are well stocked!</div>
          <div className="text-xs text-gray-400">No materials are below their reorder levels</div>
        </div>
      ) : (
        <div className="space-y-3">
          {materials.map(material => (
            <div key={material._id} className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900">{material.name}</div>
                <div className="text-xs text-gray-600">
                  Current: {material.currentStock} {material.unit} 
                  <span className="text-red-600 ml-1">
                    (Reorder at: {material.reorderLevel} {material.unit})
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Low Stock
                </span>
              </div>
            </div>
          ))}

          <div className="pt-2 border-t border-gray-200">
            <a 
              href="/admin/materials" 
              className="text-xs text-[#5E372E] hover:underline"
            >
              View all materials →
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default LowStockMaterials;