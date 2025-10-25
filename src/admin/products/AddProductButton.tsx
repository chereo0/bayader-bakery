import React from 'react'

const AddProductButton: React.FC<{ onClick?: ()=>void }> = ({ onClick }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-display text-[#5E372E]">Products Management</h2>
      <button onClick={onClick} className="bg-[#d4ac6f] text-white px-4 py-2 rounded shadow hover:brightness-95 transition">+ Add New Product</button>
    </div>
  )
}

export default AddProductButton
