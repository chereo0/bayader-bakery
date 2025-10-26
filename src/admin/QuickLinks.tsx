import React from 'react'

const QuickLinks: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded shadow-sm flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <button className="bg-[#6b3f2f] text-white px-4 py-2 rounded">Add New Product</button>
      <button className="bg-[#f0e6de] text-[#5E372E] px-4 py-2 rounded">Edit</button>
      <button className="bg-[#f0e6de] text-[#5E372E] px-4 py-2 rounded">View All</button>
    </div>
  )
}

export default QuickLinks
