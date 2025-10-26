import React from 'react'

const Feedbacks: React.FC = () => {
  const list = [
    { id: 1, user: 'Pelivas', text: 'Addilrey T7a-nip!', stars: 5 },
    { id: 2, user: 'Anonymous', text: 'All e aeo.dtrte youl', stars: 4 }
  ]

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <h3 className="text-lg font-medium text-[#5E372E]">Customer Feedback</h3>
      <div className="space-y-3 mt-3">
        {list.map(f => (
          <div key={f.id} className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium">{f.user}</div>
              <div className="text-sm text-[#6b4f45]">{f.text}</div>
            </div>
            <div className="text-right">
              <div className="text-yellow-500">{'★'.repeat(f.stars)}</div>
              <button className="mt-2 bg-[#6b3f2f] text-white px-3 py-1 rounded text-sm">Reply</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Feedbacks
