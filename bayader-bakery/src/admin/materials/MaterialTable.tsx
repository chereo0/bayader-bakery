import React from 'react';
import { Material } from '../services/materialService';

interface Props {
  materials: Material[];
  onEdit: (material: Material) => void;
  onDelete: (material: Material) => void;
  onStockAdjustment: (material: Material, adjustment: number) => void;
}

const StatusBadge: React.FC<{ material: Material }> = ({ material }) => {
  if (!material.isActive) {
    return <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs">Inactive</span>;
  }
  
  if (material.isLowStock) {
    return <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs">Low Stock</span>;
  }
  
  return <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">Active</span>;
};

const StockActions: React.FC<{ material: Material; onStockAdjustment: (material: Material, adjustment: number) => void }> = ({ 
  material, 
  onStockAdjustment 
}) => {
  const handleQuickAdjustment = (adjustment: number) => {
    if (material.currentStock + adjustment < 0) {
      alert('Adjustment would result in negative stock');
      return;
    }
    onStockAdjustment(material, adjustment);
  };

  const handleCustomAdjustment = () => {
    const input = prompt(`Adjust stock for ${material.name} (current: ${material.currentStock} ${material.unit}).\nEnter positive number to add, negative to subtract:`);
    if (input === null) return;
    
    const adjustment = parseFloat(input);
    if (isNaN(adjustment)) {
      alert('Please enter a valid number');
      return;
    }
    
    if (material.currentStock + adjustment < 0) {
      alert('Adjustment would result in negative stock');
      return;
    }
    
    onStockAdjustment(material, adjustment);
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => handleQuickAdjustment(-1)}
        className="text-red-600 hover:text-red-800 px-1 py-0.5 text-xs border border-red-300 rounded"
        title="Subtract 1"
        disabled={material.currentStock <= 0}
      >
        -1
      </button>
      <button
        onClick={() => handleQuickAdjustment(1)}
        className="text-green-600 hover:text-green-800 px-1 py-0.5 text-xs border border-green-300 rounded"
        title="Add 1"
      >
        +1
      </button>
      <button
        onClick={handleCustomAdjustment}
        className="text-blue-600 hover:text-blue-800 px-1 py-0.5 text-xs border border-blue-300 rounded"
        title="Custom adjustment"
      >
        ±
      </button>
    </div>
  );
};

const MaterialTable: React.FC<Props> = ({ materials, onEdit, onDelete, onStockAdjustment }) => {
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
              <th className="py-3 px-4 font-medium">Supplier</th>
              <th className="py-3 px-4 font-medium">Unit Price</th>
              <th className="py-3 px-4 font-medium">Stock Actions</th>
              <th className="py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {materials.map(material => (
              <tr key={material._id} className="border-t hover:bg-neutral-50 transition">
                <td className="py-3 px-4 font-medium">
                  {material.name}
                  {material.description && (
                    <div className="text-xs text-gray-500 mt-0.5">{material.description}</div>
                  )}
                </td>
                <td className="py-3 px-4 text-sm">{material.unit}</td>
                <td className="py-3 px-4">
                  <span className={`font-medium ${material.isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                    {material.currentStock}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">{material.reorderLevel}</td>
                <td className="py-3 px-4">
                  <StatusBadge material={material} />
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {material.supplier || '-'}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {material.unitPrice ? `$${material.unitPrice.toFixed(2)}` : '-'}
                </td>
                <td className="py-3 px-4">
                  {material.isActive && (
                    <StockActions material={material} onStockAdjustment={onStockAdjustment} />
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onEdit(material)} 
                      className="text-sm text-[#5E372E] hover:underline"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => onDelete(material)} 
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t">
        <div className="text-sm text-gray-500">
          Showing {materials.length} material{materials.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};

export default MaterialTable;