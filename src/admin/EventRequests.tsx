import React from 'react'

const EventRequests: React.FC = () => {
  const requests = [
    { id: 1, title: 'Adibail Teme', details: 'Bout-dint Rico blnp be 5 units' },
    { id: 2, title: 'Suitec Sle.bwcu 5 veily', details: 'cnd Onele Cheahbey' }
  ]

  return (
    <div className="bg-white p-4 rounded shadow-sm space-y-4">
      <h3 className="text-lg font-medium text-[#5E372E]">Event Requests</h3>
      {requests.map(r => (
        <div key={r.id} className="flex items-center justify-between">
          <div>
            <div className="font-medium">{r.title}</div>
            <div className="text-sm text-[#6b4f45]">{r.details}</div>
          </div>
          <button className="bg-[#6b3f2f] text-white px-3 py-1 rounded">Manage</button>
        </div>
      ))}
    </div>
  )
}

export default EventRequests
