import React from 'react'

const sampleOrders = [
  { id: 'A001', customer: 'Leseter', status: 'Shipped' },
  { id: 'A002', customer: 'Pestong Gmims', status: 'Processing' },
  { id: 'A003', customer: 'Delliney Lory', status: 'Delivered' }
]

const OrdersTable: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <h3 className="text-lg font-medium text-[#5E372E] mb-4">Recent Orders</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs text-gray-500">
              <th className="py-2">Order ID</th>
              <th className="py-2">Customer</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {sampleOrders.map(o => (
              <tr key={o.id} className="border-t">
                <td className="py-2 font-medium">{o.id}</td>
                <td className="py-2">{o.customer}</td>
                <td className="py-2">{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default OrdersTable
